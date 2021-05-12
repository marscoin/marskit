/**
 * @format
 * @flow strict-local
 */

import React, { memo, ReactElement, useState } from 'react';
import { Platform, StyleSheet } from 'react-native';
import BitcoinLogo from '../../../assets/bitcoin-logo.svg';
import LightningLogo from '../../../assets/lightning-logo.svg';
import { Feather, TextInput, View, Text } from '../../../styles/components';
import {
	setupOnChainTransaction,
	updateOnChainTransaction,
} from '../../../store/actions/wallet';
import {
	useBalance,
	useTransactionDetails,
	useChangeAddress,
} from './TransactionHook';
import Button from '../../../components/Button';
import {
	createFundedPsbtTransaction,
	getTransactionOutputValue,
	signPsbt,
} from '../../../utils/wallet/transactions';
import OutputSummary from './OutputSummary';
import { openChannelStream } from '../../../utils/lightning';
import {
	showErrorNotification,
	showInfoNotification,
	showSuccessNotification,
} from '../../../utils/notifications';
import { bytesToHexString } from '../../../utils/converters';
import lnd, { lnrpc } from 'react-native-lightning/src/index';
import { useSelector } from 'react-redux';
import Store from '../../../store/types';
import { useNavigation } from '@react-navigation/native';
import { Psbt } from 'bitcoinjs-lib';

const BitcoinToLightning = (): ReactElement => {
	const [value, setValue] = useState('');
	const [psbt, setPsbt] = useState(new Psbt());
	const [state, setState] = useState('');
	const [channelID, setChannelID] = useState(new Uint8Array());
	const navigation = useNavigation();

	const selectedWallet = useSelector(
		(store: Store) => store.wallet.selectedWallet,
	);
	const selectedNetwork = useSelector(
		(store: Store) => store.wallet.selectedNetwork,
	);
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

		setState(update || 'Unknown  state');

		if (update === 'chanPending') {
			//TODO close the modal, now we wait
		}

		if (psbtFund) {
			const { fundingAddress, fundingAmount } = psbtFund;
			if (fundingAddress && fundingAmount) {
				await updateOnChainTransaction({
					selectedNetwork,
					selectedWallet,
					transaction: {
						outputs: [
							{
								address: fundingAddress,
								value: Number(fundingAmount),
								index: 0,
							},
						],
					},
				});

				await onPsbtFund(pendingChanId);
			}
			//TODO set transaction details here
		}
	};

	/**
	 * Starts the channel opening process
	 * @returns {Promise<void>}
	 */
	const onStart = async (): Promise<void> => {
		//TODO validate amount
		const amount = balance - 5000;

		const id = openChannelStream(
			amount,
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
		//TODO create TX
		const fundedPsbtRes = await createFundedPsbtTransaction({
			selectedWallet,
			selectedNetwork,
		});

		if (fundedPsbtRes.isErr()) {
			expect(fundedPsbtRes.error.message).toBeUndefined();
			return;
		}

		//TODO verify
		setPsbt(fundedPsbtRes.value);

		console.log(fundedPsbtRes.value.toBase64());

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
	};

	/**
	 * Cancels our channel opening and closes the modal
	 */
	const onCancel = async (): Promise<void> => {
		if (channelID.length > 0) {
			const res = await lnd.fundingStateStep(channelID, '', 'cancel');

			if (res.isErr()) {
				return showErrorNotification({
					title: 'Failed to cancel channel',
					message: '',
				});
			}

			setChannelID(new Uint8Array());
			setPsbt('');
			setState('');

			showInfoNotification({ title: 'Channel cancelled', message: '' });
		}

		setupOnChainTransaction({ selectedNetwork, selectedWallet });
	};

	const onClose = async (): Promise<void> => {
		await onCancel();
		navigation.goBack();
	};

	/**
	 * Cancel the channel when the modal is dismissed
	 */
	// useEffect(() => {
	// 	return (): void => {
	// 		// onCancel().then();
	// 	};
	// }, [onCancel]);

	return (
		<View style={styles.container}>
			<View color={'transparent'} style={styles.header}>
				<BitcoinLogo viewBox="0 0 70 70" height={65} width={65} />
				{/*<Text style={styles.headerTitle}>Switch</Text>*/}
				<Feather name={'arrow-right'} size={30} />
				<LightningLogo viewBox="0 0 300 300" height={65} width={65} />
			</View>
			<Text>Available balance: {balance}</Text>
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
			/>

			{state ? <Text>STATE: {state}</Text> : null}
			{channelID.length > 0 ? (
				<Text>Channel ID: {bytesToHexString(channelID)}</Text>
			) : null}
			{psbt.txInputs.length > 0 ? <Text>PSBT: {psbt.toBase64()}</Text> : null}

			{channelID.length > 0 ? (
				<OutputSummary
					outputs={transaction.outputs || []}
					changeAddress={changeAddress}
					sendAmount={getTransactionOutputValue({})}
					fee={transaction.fee || 0}
				/>
			) : null}

			{channelID.length === 0 ? (
				<Button color={'onSurface'} text="Move funds" onPress={onStart} />
			) : null}

			{psbt.txInputs.length > 0 ? (
				<Button color={'onSurface'} text="Confirm" onPress={onChannelFund} />
			) : null}

			<Button color={'onSurface'} text="Cancel" onPress={onClose} />
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
	multilineTextInput: {
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
		paddingTop: Platform.OS === 'ios' ? 15 : 10,
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
});

export default memo(BitcoinToLightning);
