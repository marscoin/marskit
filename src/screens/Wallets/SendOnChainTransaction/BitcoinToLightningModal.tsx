/**
 * @format
 * @flow strict-local
 */

import React, {
	memo,
	ReactElement,
	useCallback,
	useEffect,
	useState,
} from 'react';
import { LayoutAnimation, StyleSheet, TouchableOpacity } from 'react-native';
import BitcoinLogo from '../../../assets/bitcoin-logo.svg';
import LightningLogo from '../../../assets/lightning-logo.svg';
import { Feather, TextInput, View, Text } from '../../../styles/components';
import {
	resetOnChainTransaction,
	setupOnChainTransaction,
} from '../../../store/actions/wallet';
import { useBalance, useTransactionDetails } from '../../../hooks/transaction';
import Button from '../../../components/Button';
import {
	getTotalFee,
	signPsbt,
	updateFee,
} from '../../../utils/wallet/transactions';
import { showErrorNotification } from '../../../utils/notifications';
import { useSelector } from 'react-redux';
import Store from '../../../store/types';
import { useNavigation } from '@react-navigation/native';
import { Psbt } from 'bitcoinjs-lib';
import AdjustValue from '../../../components/AdjustValue';
import FeeSummary from './FeeSummary';
import useDisplayValues from '../../../hooks/displayValues';
import { hasEnabledAuthentication } from '../../../utils/settings';

const BitcoinToLightning = (): ReactElement => {
	const [value, setValue] = useState('');
	const [psbt] = useState(new Psbt());
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

	const { bitcoinFormatted, bitcoinSymbol, fiatFormatted, fiatSymbol } =
		useDisplayValues(balance);

	useEffect(() => {
		setupOnChainTransaction({
			selectedWallet,
			selectedNetwork,
		}).then();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	/**
	 * Returns the satsPerByte for the given transaction.
	 */
	const getSatsPerByte = useCallback((): number => {
		try {
			return transaction?.satsPerByte || 1;
		} catch (e) {
			return 1;
		}
	}, [transaction?.satsPerByte]);
	const satsPerByte = getSatsPerByte();

	/**
	 * Adjusts the fee of the current on-chain transaction by a specified amount.
	 * @param {number} adjustBy
	 */
	const adjustFee = (adjustBy = 0): void => {
		const spb = satsPerByte || 0;
		updateFee({
			selectedNetwork,
			selectedWallet,
			satsPerByte: spb + adjustBy,
		});
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

		const totalFee = getTotalFee({
			selectedNetwork,
			selectedWallet,
			satsPerByte,
			fundingLightning: true,
		});

		if (fundingAmount + totalFee > balance) {
			//fundingAmount = fundingAmount - totalFee;
		}

		//TODO: Initiate Channel Opening
		const channelId = new Uint8Array();
		setChannelID(channelId);
	};

	/**
	 * Creates a PSBT from our on chain wallet
	 */
	/*const onPsbtFund = async (id: Uint8Array): Promise<void> => {
		const fundedPsbtRes = await createFundedPsbtTransaction({
			selectedWallet,
			selectedNetwork,
		});

		if (fundedPsbtRes.isErr()) {
			expect(fundedPsbtRes.error.message).toBeUndefined();
			return;
		}

		setPsbt(fundedPsbtRes.value);

		//TODO: Initiate Channel Funding
		console.log(id);
	};*/

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

		//TODO: Initiate Channel Funding

		/*updateWalletBalance({
			balance: balance - Number(value),
			selectedWallet,
			selectedNetwork,
		});*/

		await resetStore();

		onClose();
	};

	const resetStore = async (): Promise<void> => {
		await resetOnChainTransaction({
			selectedNetwork,
			selectedWallet,
		});
	};

	/**
	 * Cancels our channel opening and closes the modal
	 */
	const onCancel = async (): Promise<void> => {};

	const onClose = (): void => {
		navigation.goBack();
	};

	const setMax = (): void => {
		setValue(`${balance}`);
	};

	const authCheck = (): void => {
		const { pin, biometrics } = hasEnabledAuthentication();
		if (pin || biometrics) {
			// @ts-ignore
			navigation.navigate('AuthCheck', {
				onSuccess: () => {
					// @ts-ignore
					navigation.pop();
					setTimeout(() => {
						onStart().then();
					}, 500);
				},
			});
		} else {
			onStart().then();
		}
	};

	const showConfirm = psbt.txInputs.length > 0;

	const hasChannelId = useCallback(() => {
		return channelID?.length > 0 || false;
	}, [channelID]);

	LayoutAnimation.easeInEaseOut();

	return (
		<View style={styles.container}>
			<View color={'transparent'} style={styles.header}>
				<BitcoinLogo viewBox="0 0 70 70" height={65} width={65} />
				<Feather name={'arrow-right'} size={30} />
				<LightningLogo viewBox="0 0 300 300" height={65} width={65} />
			</View>

			<TouchableOpacity onPress={setMax}>
				<Text style={styles.availableBalance}>
					Available balance:{'\n'}
					{bitcoinSymbol}
					{bitcoinFormatted}
					{'\n'}
					{fiatSymbol}
					{fiatFormatted}
				</Text>
			</TouchableOpacity>

			<TextInput
				underlineColorAndroid="transparent"
				style={[
					styles.textInput,
					// eslint-disable-next-line react-native/no-inline-styles
					{ backgroundColor: hasChannelId() ? '#E1E1E4' : 'white' },
				]}
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

			{!hasChannelId() ? (
				<AdjustValue
					value={satsPerByte}
					decreaseValue={(): void => adjustFee(-1)}
					increaseValue={(): void => adjustFee(1)}
				/>
			) : null}

			<FeeSummary amount={value} lightning />

			{!hasChannelId() ? (
				<Button color={'onSurface'} text="Move Funds" onPress={authCheck} />
			) : null}

			{showConfirm ? (
				<Button color={'onSurface'} text="Confirm" onPress={onChannelFund} />
			) : null}

			<Button
				color={'onSurface'}
				text="Cancel"
				onPress={async (): Promise<void> => {
					await resetStore();
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
