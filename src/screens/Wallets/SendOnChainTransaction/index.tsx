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
import { useSelector } from 'react-redux';
import Store from '../../../store/types';
import Button from '../../../components/Button';
import { systemWeights } from 'react-native-typography';
import {
	broadcastTransaction,
	createTransaction,
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
import AssetPicker from '../../../components/AssetPicker';
import { toggleView } from '../../../store/actions/user';
import { getStore } from '../../../store/helpers';
import BottomSheetWrapper from '../../../components/BottomSheetWrapper';
import AmountToggle from '../../../components/AmountToggle';
import FeePicker from './FeePicker';
import { updateOnchainFeeEstimates } from '../../../store/actions/fees';

interface ISendOnChainTransaction {
	onComplete?: Function;
}

const onCoinSelectionPress = (): void => {
	toggleView({
		view: 'coinSelection',
		data: {
			isOpen: true,
			snapPoint: 1,
		},
	});
};

const SendOnChainTransaction = ({
	onComplete = (): null => null,
}: ISendOnChainTransaction): ReactElement => {
	//const [spendMaxAmount, setSpendMaxAmount] = useState(false);
	const [isCreatingTransaction, setIsCreatingTransaction] = useState(false);
	const [rawTx, setRawTx] = useState<string | undefined>(undefined);
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

	const coinSelectionButtonText = useMemo(() => {
		return `Coin Selection (${transaction.inputs?.length ?? '0'}/${
			utxos?.length ?? '0'
		})`;
	}, [transaction.inputs?.length, utxos?.length]);

	const _createTransaction = useCallback(async (): Promise<void> => {
		try {
			setIsCreatingTransaction(true);
			const transactionIsValid = validateTransaction(transaction);
			if (transactionIsValid.isErr()) {
				setIsCreatingTransaction(false);
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
							setRawTx(response.value.hex);
						},
					});
				} else {
					setRawTx(response.value.hex);
				}
			}
			setIsCreatingTransaction(false);
		} catch (e) {
			setIsCreatingTransaction(false);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectedNetwork, selectedWallet, transaction]);

	const broadcast = useCallback(async () => {
		const response = await broadcastTransaction({
			rawTx: rawTx ?? '',
			selectedNetwork,
		});
		if (response.isErr()) {
			showErrorNotification({
				title: 'Error: Unable to Broadcast Transaction',
				message: 'Please check your connection and try again.',
			});
			return;
		}
		showSuccessNotification({
			title: 'Successfully Broadcast',
			message: `Sent ${transactionTotal} sats`,
		});

		//Temporarily update the balance until the Electrum mempool catches up in a few seconds.
		updateWalletBalance({
			balance: balance - transactionTotal,
			selectedWallet,
			selectedNetwork,
		});

		resetOnChainTransaction({
			selectedNetwork,
			selectedWallet,
		});

		const currentView = getStore().user?.viewController?.sendAssetPicker?.isOpen
			? 'sendAssetPicker'
			: 'send';
		toggleView({ view: currentView, data: { isOpen: false } });
		//Successful broadcast, reset rawTx.
		setRawTx(undefined);
		onComplete(response?.value);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [
		balance,
		message,
		rawTx,
		selectedNetwork,
		selectedWallet,
		transactionTotal,
	]);

	LayoutAnimation.easeInEaseOut();

	if (rawTx) {
		return (
			<>
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
							setRawTx(undefined);
						}}>
						<Text style={styles.title}>Cancel</Text>
					</TouchableOpacity>
					<TouchableOpacity
						style={styles.broadcastButton}
						color={'onSurface'}
						onPress={broadcast}>
						<Text style={styles.title}>Broadcast</Text>
					</TouchableOpacity>
				</View>
			</>
		);
	}

	return (
		<>
			<View color={'onSurface'} style={styles.container}>
				<AmountToggle sats={amount} style={styles.amountToggle} />
				<View style={styles.content}>
					<AssetPicker assetName="Bitcoin" sats={balance} />
					<SendForm />
					{utxos?.length > 1 && (
						<Button
							color={'gray4'}
							text={coinSelectionButtonText}
							onPress={onCoinSelectionPress}
							disabled={isCreatingTransaction}
						/>
					)}
				</View>
			</View>
			<Button
				style={styles.nextButton}
				disabled={balance < transactionTotal || isCreatingTransaction}
				color={'surface'}
				text="Next"
				onPress={_createTransaction}
				loading={isCreatingTransaction}
			/>
			<BottomSheetWrapper
				onOpen={(): Promise<void> =>
					updateOnchainFeeEstimates({ selectedNetwork }).then()
				}
				view="feePicker"
				snapPoints={['75%', '75%']}>
				<FeePicker />
			</BottomSheetWrapper>
		</>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		marginBottom: 20,
	},
	nextButton: {
		borderRadius: 50,
		marginHorizontal: 17,
		paddingVertical: 13,
		marginBottom: 40,
		alignItems: 'center',
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
	amountToggle: {
		paddingTop: 20,
		paddingVertical: 25,
		paddingHorizontal: 16,
	},
});

export default memo(SendOnChainTransaction);
