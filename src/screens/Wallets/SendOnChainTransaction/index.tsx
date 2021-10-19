import React, {
	memo,
	ReactElement,
	useCallback,
	useEffect,
	useMemo,
	useState,
} from 'react';
import { LayoutAnimation, StyleSheet } from 'react-native';
import { View, Text, TouchableOpacity } from '../../../styles/components';
import NavigationHeader from '../../../components/NavigationHeader';
import { useSelector } from 'react-redux';
import Store from '../../../store/types';
import Button from '../../../components/Button';
import { systemWeights } from 'react-native-typography';
import {
	broadcastTransaction,
	createTransaction,
	getTransactionInputValue,
	getTransactionOutputValue,
	validateTransaction,
} from '../../../utils/wallet/transactions';
import {
	resetOnChainTransaction,
	setupOnChainTransaction,
	updateWalletBalance,
} from '../../../store/actions/wallet';
import {
	showErrorNotification,
	showSuccessNotification,
} from '../../../utils/notifications';
import { defaultOnChainTransactionData } from '../../../store/types/wallet';
import SendForm from '../../../components/SendForm';
import Summary from './Summary';
import OutputSummary from './OutputSummary';
import FeeSummary from './FeeSummary';
import { useNavigation } from '@react-navigation/native';
import { hasEnabledAuthentication } from '../../../utils/settings';
import UTXOList from './UTXOList';
import BalanceToggle from '../../../components/BalanceToggle';
import AssetPicker from '../../../components/AssetPicker';

interface ISendOnChainTransaction {
	header?: boolean;
	onComplete?: Function;
}
const SendOnChainTransaction = ({
	header = true,
	onComplete = (): null => null,
}: ISendOnChainTransaction): ReactElement => {
	//const [spendMaxAmount, setSpendMaxAmount] = useState(false);
	const [rawTx, setRawTx] = useState('');
	const [displayUtxoList, setDisplayUtxoList] = useState(false);
	const navigation = useNavigation();

	const selectedWallet = useSelector(
		(store: Store) => store.wallet.selectedWallet,
	);
	const selectedNetwork = useSelector(
		(store: Store) => store.wallet.selectedNetwork,
	);

	const balance = useSelector(
		(store: Store) =>
			store.wallet.wallets[selectedWallet]?.balance[selectedNetwork],
	);

	const transaction = useSelector(
		(store: Store) =>
			store.wallet.wallets[selectedWallet]?.transaction[selectedNetwork] ||
			defaultOnChainTransactionData,
	);

	const utxos = useSelector(
		(store: Store) =>
			store.wallet.wallets[selectedWallet]?.utxos[selectedNetwork] || [],
	);

	const addressType = useSelector(
		(store: Store) =>
			store.wallet.wallets[selectedWallet]?.addressType[selectedNetwork],
	);

	const changeAddress = useSelector(
		(store: Store) =>
			store.wallet.wallets[selectedWallet]?.changeAddressIndex[selectedNetwork][
				addressType
			] || ' ',
	);

	useEffect(() => {
		if (transaction?.rbf) {
			return;
		}
		setupOnChainTransaction({
			selectedWallet,
			selectedNetwork,
		});
		return (): void => {
			if (transaction?.rbf) {
				return;
			}
			resetOnChainTransaction({ selectedNetwork, selectedWallet });
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const Header = useCallback((): ReactElement | null => {
		if (header) {
			return <NavigationHeader title="Send Transaction" />;
		}
		return null;
	}, [header]);

	const { outputs, message } = transaction;
	const totalFee = transaction.fee;

	/*
	 * Retrieves total value of all outputs. Excludes change address.
	 */
	const getAmountToSend = useCallback((): number => {
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

	const amount = getAmountToSend();

	const getTransactionTotal = useCallback((): number => {
		try {
			return Number(amount) + Number(totalFee);
		} catch {
			return Number(totalFee);
		}
	}, [amount, totalFee]);

	const transactionTotal = getTransactionTotal();

	const txInputValue = useMemo(
		() => getTransactionInputValue({ selectedWallet, selectedNetwork }),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[selectedNetwork, selectedWallet, transaction?.inputs],
	);

	const _createTransaction = async (): Promise<void> => {
		try {
			const transactionIsValid = validateTransaction(transaction);
			if (transactionIsValid.isErr()) {
				showErrorNotification({
					title: 'Error creating transaction.',
					message: transactionIsValid.error.message,
				});
				return;
			}
			const response = await createTransaction({
				selectedNetwork,
				selectedWallet,
			});
			if (response.isOk()) {
				if (__DEV__) {
					console.log(response.value);
				}
				const { pin, biometrics } = hasEnabledAuthentication();
				if (pin || biometrics) {
					// @ts-ignore
					navigation.navigate('AuthCheck', {
						onSuccess: () => {
							// @ts-ignore
							navigation.pop();
							setRawTx(response.value);
						},
					});
				} else {
					setRawTx(response.value);
				}
			}
		} catch {}
	};

	LayoutAnimation.easeInEaseOut();

	if (rawTx) {
		return (
			<>
				<Header />
				<OutputSummary outputs={outputs} changeAddress={changeAddress}>
					<FeeSummary />
				</OutputSummary>
				<View color={'transparent'} style={styles.row}>
					<Summary leftText={'Total:'} rightText={`${transactionTotal} sats`} />
					<TouchableOpacity
						style={styles.broadcastButton}
						color={'onSurface'}
						onPress={async (): Promise<void> => {
							setupOnChainTransaction({
								selectedWallet,
								selectedNetwork,
							});
							setRawTx('');
						}}>
						<Text style={styles.title}>Cancel</Text>
					</TouchableOpacity>
					<TouchableOpacity
						style={styles.broadcastButton}
						color={'onSurface'}
						onPress={async (): Promise<void> => {
							const response = await broadcastTransaction({
								rawTx,
								selectedNetwork,
							});
							//Successful Broadcast
							if (response.isOk()) {
								setRawTx('');
								resetOnChainTransaction({
									selectedNetwork,
									selectedWallet,
								});
								showSuccessNotification({
									title: `Sent ${transactionTotal} sats`,
									message,
								});
								//Temporarily update the balance until the Electrum mempool catches up in a few seconds.
								updateWalletBalance({
									balance: balance - transactionTotal,
									selectedWallet,
									selectedNetwork,
								});
								onComplete(response.value);
								return;
							}

							showErrorNotification({
								title: 'Error: Unable to Broadcast Transaction',
								message: 'Please check your connection and try again.',
							});
						}}>
						<Text style={styles.title}>Broadcast</Text>
					</TouchableOpacity>
				</View>
			</>
		);
	}

	return (
		<View color="onSurface" style={styles.container}>
			<Header />
			<BalanceToggle sats={txInputValue} />
			<View style={styles.content}>
				<AssetPicker assetName="Bitcoin" sats={balance} />
				<SendForm />
				<Button
					color={'onSurface'}
					text={`UTXO List (${transaction.inputs?.length ?? '0'}/${
						utxos?.length ?? '0'
					})`}
					onPress={(): void => setDisplayUtxoList(true)}
				/>
				<UTXOList
					isVisible={displayUtxoList}
					closeList={(): void => setDisplayUtxoList(false)}
				/>
				<Button
					disabled={balance < transactionTotal}
					color="onSurface"
					text="Create"
					onPress={_createTransaction}
				/>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		marginBottom: 20,
		justifyContent: 'space-evenly',
	},
	content: {
		marginHorizontal: 10,
		backgroundColor: 'transparent',
	},
	title: {
		...systemWeights.bold,
		fontSize: 16,
		textAlign: 'center',
		padding: 5,
	},
	row: {
		flexDirection: 'row',
		justifyContent: 'space-evenly',
	},
	broadcastButton: {
		width: '40%',
		borderRadius: 10,
		alignSelf: 'center',
		paddingVertical: 5,
	},
});

export default memo(SendOnChainTransaction);
