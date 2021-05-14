/**
 * @format
 * @flow strict-local
 */

import React, { memo, ReactElement, useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import BitcoinLogo from '../../../assets/bitcoin-logo.svg';
import LightningLogo from '../../../assets/lightning-logo.svg';
import { Feather, TextInput, View, Text } from '../../../styles/components';
import {
	setupOnChainTransaction,
	updateOnChainTransaction,
	updateWalletBalance,
} from '../../../store/actions/wallet';
import {
	useBalance,
	useTransactionDetails,
	useChangeAddress,
} from './TransactionHook';
import Button from '../../../components/Button';
import {
	createFundedPsbtTransaction,
	getByteCount,
	getTotalFee,
	getTransactionOutputValue,
	signPsbt,
} from '../../../utils/wallet/transactions';
import OutputSummary from './OutputSummary';
import {
	connectToDefaultPeer,
	openChannelStream,
} from '../../../utils/lightning';
import {
	showErrorNotification,
	showSuccessNotification,
} from '../../../utils/notifications';
import lnd, { lnrpc } from 'react-native-lightning/src/index';
import { useSelector } from 'react-redux';
import Store from '../../../store/types';
import { useNavigation } from '@react-navigation/native';
import { Psbt } from 'bitcoinjs-lib';
import { getCurrentWallet } from '../../../utils/wallet';

const BitcoinToLightning = (): ReactElement => {
	const [value, setValue] = useState('');
	const [psbt, setPsbt] = useState(new Psbt());
	const [channelID, setChannelID] = useState(new Uint8Array());
	const navigation = useNavigation();

	const selectedWallet = useSelector(
		(store: Store) => store.wallet.selectedWallet,
	);
	const selectedNetwork = useSelector(
		(store: Store) => store.wallet.selectedNetwork,
	);
	const { currentWallet } = getCurrentWallet({
		selectedNetwork,
		selectedWallet,
	});
	const transaction = useTransactionDetails();
	const balance = useBalance();
	const changeAddress = useChangeAddress();

	/**
	 * Channel open state has progressed
	 * @param channelState
	 */
	const onStateUpdate = async (
		channelState: lnrpc.OpenStatusUpdate,
	): Promise<void> => {
		const { psbtFund, update, pendingChanId } = channelState;

		switch (update) {
			//Channel funding TX fully confirmed
			case 'chanOpen': {
				showSuccessNotification({
					title: 'Lightning channel opened',
					message: 'Lightning payments can now be made',
				});
				return;
			}
			//Channel funding finalized now the user just needs to wait 2 confs
			case 'chanPending': {
				showSuccessNotification({
					title: 'Success',
					message: 'Lightning channel opening...',
				});
				onClose();
				return;
			}
			//A funded (not yet signed) PSBT can now be created using the returned output
			case 'psbtFund': {
				const { fundingAddress, fundingAmount } = psbtFund!;
				if (fundingAddress && fundingAmount) {
					let outputValue = Number(fundingAmount);

					await updateOnChainTransaction({
						selectedNetwork,
						selectedWallet,
						transaction: {
							outputs: [
								{
									address: fundingAddress,
									value: outputValue,
									index: 0,
								},
							],
						},
					});

					await onPsbtFund(pendingChanId);
				}
				return;
			}
		}
	};

	/**
	 * Starts the channel opening process
	 * @returns {Promise<void>}
	 */
	const onStart = async (): Promise<void> => {
		let fundingAmount = Number(value);

		const minChannelSize = 20000;
		if (fundingAmount < minChannelSize) {
			return showErrorNotification({
				title: 'Channel too small',
				message: `Fund the channel with more than ${minChannelSize} sats`,
			});
		}

		if (fundingAmount > balance) {
			return showErrorNotification({
				title: 'Insufficient balance',
				message: `Fund the channel with less than ${balance} sats`,
			});
		}

		//TODO get the true fee calculation once getTotalFee has been updated to support this address type
		const fee = 250;
		if (fundingAmount + fee > balance) {
			fundingAmount = fundingAmount - fee;
		}

		const id = openChannelStream(
			fundingAmount,
			(channelStateRes) => {
				if (channelStateRes.isErr()) {
					//Don't show if the user triggered this error on purpose
					if (
						channelStateRes.error.message.indexOf('user canceled funding') > -1
					) {
						return;
					}

					return showErrorNotification({
						title: 'Channel open failed',
						message: channelStateRes.error.message,
					});
				}

				onStateUpdate(channelStateRes.value);
			},
			() => {
				showSuccessNotification({
					title: 'Channel opened',
					message: 'Lightning channel ready to use',
				});
			},
		);

		setChannelID(id);
	};

	/**
	 * Creates a PSBT from our on chain wallet
	 */
	const onPsbtFund = async (id: Uint8Array): Promise<void> => {
		const fundedPsbtRes = await createFundedPsbtTransaction({
			selectedWallet,
			selectedNetwork,
		});

		if (fundedPsbtRes.isErr()) {
			expect(fundedPsbtRes.error.message).toBeUndefined();
			return;
		}

		setPsbt(fundedPsbtRes.value);

		const verifyRes = await lnd.fundingStateStep(
			id,
			fundedPsbtRes.value.toBase64(),
			'verify',
		);

		if (verifyRes.isErr()) {
			showErrorNotification({
				title: 'Failed to verify PSBT',
				message: verifyRes.error.message,
			});
			await onCancel();
			return;
		}
	};

	const onChannelFund = async (): Promise<void> => {
		const signedPsbtRes = await signPsbt({
			selectedWallet,
			selectedNetwork,
			psbt: psbt,
		});

		if (signedPsbtRes.isErr()) {
			expect(signedPsbtRes.error.message).toBeUndefined();
			return;
		}

		const finalizeRes = await lnd.fundingStateStep(
			channelID,
			signedPsbtRes.value.toBase64(),
			'finalize',
		);

		if (finalizeRes.isErr()) {
			showErrorNotification({
				title: 'Failed to finalize PSBT',
				message: finalizeRes.error.message,
			});
			await onCancel();
			return;
		}

		updateWalletBalance({
			balance: balance - Number(value),
			selectedWallet,
			selectedNetwork,
		});

		await resetStore();

		onClose();
	};

	const resetStore = async () => {
		await updateOnChainTransaction({
			selectedNetwork,
			selectedWallet,
			transaction: {
				outputs: [],
			},
		});
	};

	/**
	 * Cancels our channel opening and closes the modal
	 */
	const onCancel = async (): Promise<void> => {
		if (channelID.length > 0) {
			await lnd.fundingStateStep(channelID, '', 'cancel');
			setChannelID(new Uint8Array());
			setPsbt(new Psbt());
		}

		await resetStore();
	};

	const onClose = (): void => {
		navigation.goBack();
	};

	const setMax = (): void => {
		setValue(`${balance}`);
	};

	/**
	 * Connect to default peer on open and cancel the
	 * pending channel if exists when the modal is dismissed
	 */
	useEffect(() => {
		connectToDefaultPeer().then();
		return (): void => {
			onCancel().then();
		};
	}, []);

	const showConfirm = psbt.txInputs.length > 0;

	return (
		<View style={styles.container}>
			<View color={'transparent'} style={styles.header}>
				<BitcoinLogo viewBox="0 0 70 70" height={65} width={65} />
				<Feather name={'arrow-right'} size={30} />
				<LightningLogo viewBox="0 0 300 300" height={65} width={65} />
			</View>

			<TouchableOpacity onPress={setMax}>
				<Text style={styles.availableBalance}>
					Available balance: {balance} sats
				</Text>
			</TouchableOpacity>

			<TextInput
				underlineColorAndroid="transparent"
				style={styles.textInput}
				placeholder="Amount (sats)"
				keyboardType="number-pad"
				autoCapitalize="none"
				autoCompleteType="off"
				autoCorrect={false}
				onChangeText={(txt): void => {
					setValue(txt);
				}}
				value={Number(value) ? value.toString() : ''}
				onSubmitEditing={(): void => {}}
				editable={!showConfirm}
			/>

			{channelID.length > 0 ? (
				<OutputSummary
					outputs={transaction.outputs || []}
					changeAddress={changeAddress}
					sendAmount={getTransactionOutputValue({})}
					fee={transaction.fee || 0}
					lightning
				/>
			) : null}

			{channelID.length === 0 ? (
				<Button color={'onSurface'} text="Move funds" onPress={onStart} />
			) : null}

			{showConfirm ? (
				<Button color={'onSurface'} text="Confirm" onPress={onChannelFund} />
			) : null}

			<Button
				color={'onSurface'}
				text="Cancel"
				onPress={async (): Promise<void> => {
					await onCancel();
					onClose();
				}}
			/>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		paddingRight: 20,
		paddingLeft: 20,
		display: 'flex',
	},
	header: {
		display: 'flex',
		flexDirection: 'row',
		justifyContent: 'space-around',
		alignItems: 'center',
		marginTop: 20,
	},
	textInput: {
		minHeight: 50,
		borderRadius: 5,
		fontWeight: 'bold',
		fontSize: 18,
		textAlign: 'center',
		color: 'gray',
		borderBottomWidth: 1,
		borderColor: 'gray',
		paddingHorizontal: 10,
		backgroundColor: 'white',
		marginVertical: 5,
	},
	availableBalance: {
		marginTop: 20,
		marginBottom: 20,
		fontWeight: 'bold',
		fontSize: 16,
		textAlign: 'center',
	},
});

export default memo(BitcoinToLightning);
