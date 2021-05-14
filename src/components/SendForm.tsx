import React, {
	memo,
	ReactElement,
	useCallback,
	useEffect,
	useState,
} from 'react';
import { Platform, StyleSheet } from 'react-native';
import { AnimatedView, TextInput, View } from '../styles/components';
import { updateOnChainTransaction } from '../store/actions/wallet';
import AdjustFee from './AdjustFee';
import { useSelector } from 'react-redux';
import Store from '../store/types';
import {
	defaultOnChainTransactionData,
	EOutput,
	IOnChainTransactionData,
	IOutput,
} from '../store/types/wallet';
import {
	getTotalFee,
	getTransactionOutputValue,
} from '../utils/wallet/transactions';
import Button from './Button';

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

	/**
	 * Current transaction object of the selectedWallet/Network.
	 */
	const transaction = useSelector(
		(store: Store) =>
			store.wallet.wallets[selectedWallet]?.transaction[selectedNetwork] ||
			defaultOnChainTransactionData,
	);

	/**
	 * Current balance of the selectedWallet/Network.
	 */
	const balance = useSelector(
		(store: Store) =>
			store.wallet.wallets[selectedWallet]?.balance[selectedNetwork] || 0,
	);

	useEffect(() => {
		if (!transaction?.outputs?.length) {
			updateOnChainTransaction({
				selectedWallet,
				selectedNetwork,
				transaction: {
					outputs: [EOutput],
				},
			});
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	/**
	 * Returns the current output by index.
	 */
	const getOutput = (): IOutput => {
		try {
			return transaction.outputs[index];
		} catch {
			return { address: '', value: 0 };
		}
	};

	/**
	 * Returns the selected satsPerByte for the given transaction.
	 */
	const getSatsPerByte = useCallback((): number => {
		try {
			return transaction?.satsPerByte || 1;
		} catch (e) {
			return 1;
		}
	}, [transaction?.satsPerByte]);

	/**
	 * Returns the current address to send funds to.
	 */
	const getAddress = (): string => {
		try {
			return getOutput()?.address || '';
		} catch (e) {
			console.log(e);
			return '';
		}
	};

	/**
	 * Returns the value of the current output.
	 */
	const getValue = (): number => {
		try {
			return getOutput()?.value || 0;
		} catch (e) {
			return 0;
		}
	};

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
	const getMessage = useCallback(() => {
		return transaction.message || '';
	}, [transaction.message]);

	const address = getAddress();
	const value = getValue();
	const message = getMessage();
	const satsPerByte = getSatsPerByte();

	/**
	 * Returns the total calculated fee given the current satsPerByte selected and message.
	 */
	const getFee = useCallback((): number => {
		const totalFee = getTotalFee({
			satsPerByte,
			message,
			selectedWallet,
			selectedNetwork,
		});
		return totalFee || 250;
	}, [message, satsPerByte, selectedWallet, selectedNetwork]);

	/**
	 * Increases the fee by 1 sat per byte.
	 */
	const increaseFee = (): void => {
		try {
			//Check that the user has enough funds
			const newSatsPerByte = Number(satsPerByte) + 1;
			const newFee = getTotalFee({ satsPerByte: newSatsPerByte, message });
			const totalTransactionValue = getOutputsValue();
			const newTotalAmount = Number(totalTransactionValue) + Number(newFee);
			//Return if the new fee exceeds half of the user's balance
			if (Number(newFee) >= balance / 2) {
				return;
			}
			const _transaction: IOnChainTransactionData = {
				satsPerByte: newSatsPerByte,
				fee: newFee,
			};
			if (max) {
				//Update the tx value with the new fee to continue sending the max amount.
				_transaction.outputs = [{ address, value: balance - newFee, index }];
				updateOnChainTransaction({
					selectedNetwork,
					selectedWallet,
					transaction: _transaction,
				});
				return;
			}
			if (newTotalAmount <= balance) {
				updateOnChainTransaction({
					selectedNetwork,
					selectedWallet,
					transaction: _transaction,
				});
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
			const newSatsPerByte = Number(satsPerByte) - 1;
			const newFee = getTotalFee({ satsPerByte: newSatsPerByte, message });
			const _transaction: IOnChainTransactionData = {
				satsPerByte: newSatsPerByte,
				fee: newFee,
			};
			if (max) {
				//Update the tx value with the new fee to continue sending the max amount.
				_transaction.outputs = [{ address, value: balance - newFee, index }];
			}
			updateOnChainTransaction({
				selectedNetwork,
				selectedWallet,
				transaction: _transaction,
			});
		} catch {}
	};

	/**
	 * Updates the amount to send for the currently selected output.
	 * @param {string} txt
	 */
	const updateAmount = (txt = ''): void => {
		const newAmount = Number(txt);
		const totalNewAmount = newAmount + getFee();
		if (totalNewAmount <= balance) {
			updateOnChainTransaction({
				selectedWallet,
				selectedNetwork,
				transaction: {
					outputs: [{ address, value: newAmount, index }],
				},
			});
		}
	};

	const updateMessage = (txt = ''): void => {
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
			});
			return;
		}
		if (totalNewAmount <= balance) {
			updateOnChainTransaction({
				selectedNetwork,
				selectedWallet,
				transaction: _transaction,
			});
		}
	};

	/**
	 * Toggles whether to send the max balance.
	 */
	const sendMax = (): void => {
		try {
			if (!max) {
				updateOnChainTransaction({
					selectedWallet,
					selectedNetwork,
					transaction: {
						outputs: [{ address, value: balance - transaction.fee, index }],
					},
				}).then();
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
					<AdjustFee
						satsPerByte={getSatsPerByte()}
						decreaseFee={decreaseFee}
						increaseFee={increaseFee}
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
