import React, {
	memo,
	ReactElement,
	useCallback,
	useEffect,
	useMemo,
} from 'react';
import { Platform, StyleSheet } from 'react-native';
import { TextInput, View } from '../styles/components';
import { updateOnChainTransaction } from '../store/actions/wallet';
import AdjustValue from './AdjustValue';
import { useSelector } from 'react-redux';
import Store from '../store/types';
import {
	EOutput,
	IOnChainTransactionData,
	IOutput,
} from '../store/types/wallet';
import {
	adjustFee,
	getTotalFee,
	getTransactionOutputValue,
	sendMax,
	updateAmount,
	updateMessage,
} from '../utils/wallet/transactions';
import Button from './Button';
import { useBalance, useTransactionDetails } from '../hooks/transaction';

const SendForm = ({
	index = 0,
	displayMessage = true,
	displayFee = true,
}): ReactElement => {
	const selectedWallet = useSelector(
		(store: Store) => store.wallet.selectedWallet,
	);
	const selectedNetwork = useSelector(
		(store: Store) => store.wallet.selectedNetwork,
	);
	const transaction = useTransactionDetails();
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
				});
			}
			updateAmount({
				amount: newValue.toString(),
				selectedNetwork,
				selectedWallet,
				index,
			});
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

	const increaseFee = useCallback(() => {
		adjustFee({ selectedWallet, selectedNetwork, adjustBy: 1 });
	}, [selectedNetwork, selectedWallet]);
	const decreaseFee = useCallback(() => {
		adjustFee({ selectedWallet, selectedNetwork, adjustBy: -1 });
	}, [selectedNetwork, selectedWallet]);

	return (
		<View color="transparent" style={styles.container}>
			<TextInput
				multiline={true}
				textAlignVertical={'center'}
				underlineColorAndroid="transparent"
				style={styles.multilineTextInput}
				placeholder="Address"
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
			/>
			<View color={'transparent'} style={styles.row}>
				<View style={styles.amountContainer}>
					<TextInput
						editable={!max}
						underlineColorAndroid="transparent"
						style={[
							styles.textInput,
							// eslint-disable-next-line react-native/no-inline-styles
							{ backgroundColor: max ? '#E1E1E4' : 'white' },
						]}
						placeholder="Amount (sats)"
						keyboardType="number-pad"
						autoCapitalize="none"
						autoCompleteType="off"
						autoCorrect={false}
						onChangeText={(txt): void => {
							updateAmount({
								amount: txt,
								selectedWallet,
								selectedNetwork,
								index,
							});
						}}
						value={Number(value) ? value.toString() : ''}
						onSubmitEditing={(): void => {}}
					/>
				</View>
				<Button
					color={max ? 'surface' : 'onSurface'}
					text="Max"
					disabled={balance <= 0}
					onPress={sendMax}
				/>
			</View>
			{!!displayMessage && (
				<TextInput
					multiline
					underlineColorAndroid="transparent"
					style={styles.multilineTextInput}
					placeholder="Message (OP_RETURN)"
					autoCapitalize="none"
					autoCompleteType="off"
					autoCorrect={false}
					onChangeText={(txt): void => {
						updateMessage({
							message: txt,
							selectedWallet,
							selectedNetwork,
							index,
						});
					}}
					value={message}
					onSubmitEditing={(): void => {}}
				/>
			)}

			{!!displayFee && (
				<AdjustValue
					value={`${satsPerByte} sats/byte`}
					decreaseValue={decreaseFee}
					increaseValue={increaseFee}
				/>
			)}
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 0,
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
	row: {
		flexDirection: 'row',
	},
	amountContainer: {
		flex: 1,
	},
});

export default memo(SendForm);
