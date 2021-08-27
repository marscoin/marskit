import React, {
	memo,
	ReactElement,
	useCallback,
	useEffect,
	useMemo,
	useState,
} from 'react';
import { Platform, StyleSheet } from 'react-native';
import { AnimatedView, TextInput, View } from '../styles/components';
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
	getTotalFee,
	getTransactionOutputValue,
	updateFee,
} from '../utils/wallet/transactions';
import Button from './Button';
import {
	useBalance,
	useTransactionDetails,
} from '../screens/Wallets/SendOnChainTransaction/TransactionHook';
import { autoCoinSelect } from '../utils/wallet';
import { getStore } from '../store/helpers';

const SendForm = ({
	index = 0,
	displayMessage = true,
	displayFee = true,
}): ReactElement => {
	const [max, setMax] = useState(false); //Determines whether the user is sending the max amount.

	const selectedWallet = useSelector(
		(store: Store) => store.wallet.selectedWallet,
	);
	const selectedNetwork = useSelector(
		(store: Store) => store.wallet.selectedNetwork,
	);
	const coinSelectPreference = useSelector(
		(store: Store) => store.settings.coinSelectPreference,
	);
	const utxos = useSelector(
		(store: Store) =>
			store.wallet.wallets[selectedWallet].utxos[selectedNetwork],
	);

	const transaction = useTransactionDetails();

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
		const fee = transaction?.fee ?? 256;

		if (value) {
			const newValue =
				balance > 0 && value + getFee > balance ? balance - fee : 0;
			if (newValue + getFee > balance && max) {
				setMax(false);
			}
			updateAmount(newValue.toString());
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

	/**
	 * Increases the fee by 1 sat per byte.
	 */
	const increaseFee = (): void => {
		try {
			if (max) {
				//Check that the user has enough funds
				const newSatsPerByte = Number(satsPerByte) + 1;
				const newFee = getTotalFee({ satsPerByte: newSatsPerByte, message });
				//Return if the new fee exceeds half of the user's balance
				if (Number(newFee) >= balance / 2) {
					return;
				}
				const _transaction: IOnChainTransactionData = {
					satsPerByte: newSatsPerByte,
					fee: newFee,
				};
				//Update the tx value with the new fee to continue sending the max amount.
				_transaction.outputs = [{ address, value: balance - newFee, index }];
				updateOnChainTransaction({
					selectedNetwork,
					selectedWallet,
					transaction: _transaction,
				}).then();
			} else {
				updateFee({
					selectedWallet,
					selectedNetwork,
					satsPerByte: Number(satsPerByte) + 1,
				});
				if (address && coinSelectPreference !== 'consolidate') {
					runCoinSelect();
				}
			}
		} catch (e) {
			console.log(e);
		}
	};

	/**
	 * Decreases the fee by 1 sat per byte.
	 */
	const decreaseFee = (): void => {
		try {
			if (satsPerByte <= 1) {
				return;
			}
			if (max) {
				const newSatsPerByte = Number(satsPerByte) - 1;
				const newFee = getTotalFee({ satsPerByte: newSatsPerByte, message });
				const _transaction: IOnChainTransactionData = {
					satsPerByte: newSatsPerByte,
					fee: newFee,
				};
				//Update the tx value with the new fee to continue sending the max amount.
				_transaction.outputs = [{ address, value: balance - newFee, index }];
				updateOnChainTransaction({
					selectedNetwork,
					selectedWallet,
					transaction: _transaction,
				}).then();
			} else {
				updateFee({
					selectedWallet,
					selectedNetwork,
					satsPerByte: Number(satsPerByte) - 1,
				});
				if (address && coinSelectPreference !== 'consolidate') {
					runCoinSelect();
				}
			}
		} catch {}
	};

	/**
	 * Runs & Applies the autoCoinSelect method to the current transaction.
	 */
	const runCoinSelect = (): void => {
		try {
			const outputs =
				getStore().wallet.wallets[selectedWallet].transaction[selectedNetwork]
					.outputs;
			const amountToSend =
				getStore().wallet.wallets[selectedWallet].transaction[selectedNetwork]
					.value;
			const newSatsPerByte =
				getStore().wallet.wallets[selectedWallet].transaction[selectedNetwork]
					.satsPerByte;
			autoCoinSelect({
				amountToSend,
				inputs: utxos,
				outputs,
				satsPerByte: newSatsPerByte,
				sortMethod: coinSelectPreference,
			}).then((response) => {
				if (response.isErr()) {
					console.log(response.error.message);
					return;
				}
				if (transaction?.inputs?.length !== response.value.inputs.length) {
					const updatedTx: IOnChainTransactionData = {
						fee: response.value.fee,
						inputs: response.value.inputs,
					};
					updateOnChainTransaction({
						selectedWallet,
						selectedNetwork,
						transaction: updatedTx,
					}).then();
				}
			});
		} catch (e) {
			console.log(e);
		}
	};

	/**
	 * Updates the amount to send for the currently selected output.
	 * @param {string} txt
	 */
	const updateAmount = async (txt = ''): Promise<void> => {
		let newAmount = Number(txt) ?? 0;
		let totalNewAmount = 0;
		if (newAmount !== 0) {
			totalNewAmount = newAmount + getFee;
			if (totalNewAmount > balance && balance - getFee < 0) {
				newAmount = 0;
			}
		}
		//Return if the new amount exceeds the current balance or there is no change detected.
		if (
			newAmount === value ||
			newAmount > balance ||
			totalNewAmount > balance
		) {
			return;
		}
		await updateOnChainTransaction({
			selectedWallet,
			selectedNetwork,
			transaction: {
				outputs: [{ address, value: newAmount, index }],
			},
		});
		if (address && coinSelectPreference !== 'consolidate') {
			runCoinSelect();
		}
	};

	const updateMessage = async (txt = ''): Promise<void> => {
		const newFee = getTotalFee({ satsPerByte, message: txt });
		const totalTransactionValue = getOutputsValue();
		const totalNewAmount = totalTransactionValue + newFee;

		const _transaction: IOnChainTransactionData = {
			message: txt,
			fee: newFee,
		};
		if (max) {
			_transaction.outputs = [{ address, value: balance - newFee, index }];
			//Update the tx value with the new fee to continue sending the max amount.
			updateOnChainTransaction({
				selectedNetwork,
				selectedWallet,
				transaction: _transaction,
			}).then();
			return;
		}
		if (totalNewAmount <= balance) {
			await updateOnChainTransaction({
				selectedNetwork,
				selectedWallet,
				transaction: _transaction,
			});
			if (address && coinSelectPreference !== 'consolidate') {
				runCoinSelect();
			}
		}
	};

	/**
	 * Toggles whether to send the max balance.
	 */
	const sendMax = (): void => {
		try {
			if (
				!max &&
				balance > 0 &&
				transaction?.fee &&
				balance / 2 > transaction.fee
			) {
				const newFee = getTotalFee({ satsPerByte, message });
				const totalTransactionValue = getOutputsValue();
				const totalNewAmount = totalTransactionValue + newFee;

				if (totalNewAmount <= balance) {
					const _transaction: IOnChainTransactionData = {
						fee: newFee,
						outputs: [{ address, value: balance - newFee, index }],
					};
					updateOnChainTransaction({
						selectedWallet,
						selectedNetwork,
						transaction: _transaction,
					}).then();
				}
			}
			setMax(!max);
		} catch {}
	};

	return (
		<View color={'transparent'}>
			<AnimatedView color="transparent" style={styles.container}>
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
								updateAmount(txt);
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
							updateMessage(txt);
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
			</AnimatedView>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
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
