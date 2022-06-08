import React, {
	memo,
	ReactElement,
	useCallback,
	useEffect,
	useMemo,
} from 'react';
import { StyleSheet } from 'react-native';
import {
	Text02M,
	TextInput,
	TouchableOpacity,
	View,
} from '../styles/components';
import { updateOnChainTransaction } from '../store/actions/wallet';
import { useSelector } from 'react-redux';
import Store from '../store/types';
import {
	EOutput,
	IOnChainTransactionData,
	IOutput,
} from '../store/types/wallet';
import {
	getTotalFee,
	getTransactionOutputValue,
	updateAmount,
	updateMessage,
} from '../utils/wallet/transactions';
import {
	useBalance,
	useSelectedFeeId,
	useTransactionDetails,
} from '../hooks/transaction';
import Card from './Card';
import { pasteIcon } from '../assets/icons/wallet';
import { SvgXml } from 'react-native-svg';
import colors from '../styles/colors';
import Clipboard from '@react-native-clipboard/clipboard';
import { showErrorNotification } from '../utils/notifications';
import { validate } from 'bitcoin-address-validation';
import FeePickerCard from '../screens/Wallets/SendOnChainTransaction/FeePickerCard';
import { toggleView } from '../store/actions/user';
import { FeeText } from '../store/shapes/fees';

const SendForm = ({ index = 0 }): ReactElement => {
	const selectedWallet = useSelector(
		(store: Store) => store.wallet.selectedWallet,
	);
	const selectedNetwork = useSelector(
		(store: Store) => store.wallet.selectedNetwork,
	);
	const transaction = useTransactionDetails();

	const selectedFeeId = useSelectedFeeId();
	const max = useMemo(() => transaction.max, [transaction?.max]);

	const balance = useBalance();

	useEffect(() => {
		if (!transaction?.outputs?.length) {
			updateOnChainTransaction({
				selectedWallet,
				selectedNetwork,
				transaction: {
					outputs: [EOutput],
				},
			}).then();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// Handles balance changes from UTXO updates.
	useEffect(() => {
		if (transaction?.rbf) {
			return;
		}
		const fee = transaction?.fee ?? 256;

		if (value) {
			const newValue =
				balance > 0 && value + getFee > balance ? balance - fee : 0;
			if (newValue + getFee > balance && max) {
				// Disable max.
				updateOnChainTransaction({
					selectedNetwork,
					selectedWallet,
					transaction: { max: false },
				}).then();
			}
			updateAmount({
				amount: newValue.toString(),
				selectedNetwork,
				selectedWallet,
				index,
			}).then();
		}

		if (max) {
			const totalTransactionValue = getOutputsValue();
			const totalNewAmount = totalTransactionValue + fee;

			if (totalNewAmount <= balance) {
				const _transaction: IOnChainTransactionData = {
					fee,
					outputs: [{ address, value: balance - fee, index }],
				};
				updateOnChainTransaction({
					selectedWallet,
					selectedNetwork,
					transaction: _transaction,
				}).then();
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [balance]);

	/**
	 * Returns the current output by index.
	 */
	const getOutput = useMemo((): IOutput | undefined => {
		try {
			return transaction.outputs?.[index];
		} catch {
			return { address: '', value: 0 };
		}
	}, [index, transaction?.outputs]);

	/**
	 * Returns the selected satsPerByte for the given transaction.
	 */
	const satsPerByte = useMemo((): number => {
		try {
			return transaction?.satsPerByte || 1;
		} catch (e) {
			return 1;
		}
	}, [transaction?.satsPerByte]);

	/**
	 * Returns the current address to send funds to.
	 */
	const address = useMemo((): string => {
		try {
			return getOutput?.address || '';
		} catch (e) {
			console.log(e);
			return '';
		}
	}, [getOutput?.address]);

	/**
	 * Returns the value of the current output.
	 */
	const value = useMemo((): number => {
		try {
			return getOutput?.value || 0;
		} catch (e) {
			return 0;
		}
	}, [getOutput?.value]);

	/**
	 * Returns the total value of all outputs for the given transaction
	 */
	const getOutputsValue = useCallback((): number => {
		try {
			return getTransactionOutputValue({
				selectedWallet,
				selectedNetwork,
			});
		} catch {
			return 0;
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [transaction.outputs, selectedNetwork, selectedWallet]);

	/**
	 * Returns a message, if any, of the current transaction.
	 */
	const message = useMemo(() => {
		return transaction.message || '';
	}, [transaction.message]);

	/**
	 * Returns the total calculated fee given the current satsPerByte selected and message.
	 */
	const getFee = useMemo((): number => {
		const totalFee = getTotalFee({
			satsPerByte,
			message,
			selectedWallet,
			selectedNetwork,
		});
		return totalFee || 256;
	}, [message, satsPerByte, selectedWallet, selectedNetwork]);

	const handlePaste = useCallback(async () => {
		const data = await Clipboard.getString();
		if (!data) {
			showErrorNotification({
				title: 'Clipboard is empty',
				message: 'No address data available.',
			});
			return;
		}
		data.replace('bitcoinRegtest:', '');
		data.replace('bitcoinTestnet:', '');
		data.replace('bitcoin:', '');
		const addressIsValid = await validate(data);
		if (!addressIsValid) {
			showErrorNotification({
				title: 'Address is not valid.',
				message: 'No address data available.',
			});
			return;
		}
		updateOnChainTransaction({
			selectedWallet,
			selectedNetwork,
			transaction: {
				outputs: [{ address: data, value, index }],
			},
		}).then();
	}, [index, selectedNetwork, selectedWallet, value]);

	const feeCardTitle = useMemo((): string => {
		return FeeText[selectedFeeId]?.title ?? '';
	}, [selectedFeeId]);

	const feeCardDescription = useMemo((): string => {
		if (selectedFeeId === 'custom') {
			return `${satsPerByte} sats/byte`;
		}
		return FeeText[selectedFeeId]?.description ?? '';
	}, [satsPerByte, selectedFeeId]);

	return (
		<View color="transparent" style={styles.container}>
			<Card style={styles.card} color={'gray336'}>
				<>
					<View style={styles.col1}>
						<View color="transparent" style={styles.titleContainer}>
							<Text02M>To</Text02M>
							<TextInput
								style={styles.textInput}
								selectTextOnFocus={true}
								multiline={true}
								textAlignVertical={'center'}
								underlineColorAndroid="transparent"
								placeholder="Address"
								placeholderTextColor={colors.gray2}
								autoCapitalize="none"
								autoCompleteType="off"
								autoCorrect={false}
								onChangeText={(txt): void => {
									updateOnChainTransaction({
										selectedWallet,
										selectedNetwork,
										transaction: {
											outputs: [{ address: txt, value, index }],
										},
									}).then();
								}}
								value={address}
								onSubmitEditing={(): void => {}}
								blurOnSubmit={true}
							/>
						</View>
					</View>

					<TouchableOpacity
						onPress={handlePaste}
						color="transparent"
						style={styles.col2}>
						<SvgXml xml={pasteIcon()} width={20} height={20} />
					</TouchableOpacity>
				</>
			</Card>

			<Card style={styles.card} color={'gray336'}>
				<View style={styles.col1}>
					<View color="transparent" style={styles.titleContainer}>
						<Text02M>Add Note</Text02M>
						<TextInput
							style={styles.textInput}
							textAlignVertical={'center'}
							placeholderTextColor={colors.gray2}
							editable={!max}
							multiline
							underlineColorAndroid="transparent"
							placeholder="This is a transaction note"
							autoCapitalize="none"
							autoCompleteType="off"
							autoCorrect={false}
							value={message}
							onChangeText={(msg): void => {
								updateMessage({
									message: msg,
									selectedWallet,
									selectedNetwork,
								}).then();
							}}
							onSubmitEditing={(): void => {}}
						/>
					</View>
				</View>
			</Card>

			<FeePickerCard
				id={selectedFeeId}
				onPress={(): void => {
					toggleView({
						view: 'feePicker',
						data: {
							isOpen: true,
							snapPoint: 0,
						},
					}).then();
				}}
				title={feeCardTitle}
				description={feeCardDescription}
				sats={getFee}
			/>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 0,
	},
	textInput: {
		backgroundColor: 'transparent',
	},
	card: {
		minHeight: 62,
		marginBottom: 8,
		borderRadius: 20,
		paddingHorizontal: 16,
		justifyContent: 'space-between',
		alignItems: 'center',
		flexDirection: 'row',
	},
	col1: {
		flex: 1,
		alignItems: 'center',
		flexDirection: 'row',
		backgroundColor: 'transparent',
	},
	col2: {
		alignContent: 'flex-end',
		right: 4,
		backgroundColor: 'transparent',
	},
	titleContainer: {
		flex: 1,
		marginHorizontal: 12,
	},
});

export default memo(SendForm);
