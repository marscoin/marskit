import React, {
	memo,
	ReactElement,
	useCallback,
	useEffect,
	useState,
} from 'react';
import { LayoutAnimation, StyleSheet } from 'react-native';
import {
	View,
	AnimatedView,
	Text,
	TouchableOpacity,
} from '../../styles/components';
import Animated, { Easing } from 'react-native-reanimated';
import NavigationHeader from '../../components/NavigationHeader';
import { useSelector } from 'react-redux';
import Store from '../../store/types';
import Button from '../../components/Button';
import { systemWeights } from 'react-native-typography';
import {
	broadcastTransaction,
	createTransaction,
	getTransactionOutputValue,
} from '../../utils/wallet/transactions';
import {
	resetOnChainTransaction,
	setupOnChainTransaction,
	updateWalletBalance,
} from '../../store/actions/wallet';
import {
	showErrorNotification,
	showSuccessNotification,
} from '../../utils/notifications';
import {
	defaultOnChainTransactionData,
	IOutput,
} from '../../store/types/wallet';
import SendForm from '../../components/SendForm';
import { getFiatBalance } from '../../utils/helpers';

const Summary = ({
	leftText = '',
	rightText = '',
}: {
	leftText: string;
	rightText: string;
}): ReactElement => {
	return (
		<View color="transparent" style={styles.summaryContainer}>
			<View color="transparent" style={styles.row}>
				<View color="transparent" style={styles.summaryLeft}>
					<Text>{leftText}</Text>
				</View>
				<View color="transparent" style={styles.summaryRight}>
					<Text>{rightText}</Text>
				</View>
			</View>
		</View>
	);
};

const OutputSummary = ({
	outputs = [],
	changeAddress = '',
	sendAmount = 0,
	fee = 0,
}: {
	outputs: IOutput[];
	changeAddress: string;
	sendAmount: number;
	fee: number;
}): ReactElement => {
	return (
		<>
			{outputs &&
				outputs.map(({ address, value }, index) => {
					if (changeAddress !== address) {
						return (
							<View
								key={`${index}${value}`}
								color="transparent"
								style={styles.summaryContainer}>
								<View color="transparent" style={styles.summary}>
									<Text style={styles.addressText}>Address:</Text>
									<Text style={styles.addressText}>{address}</Text>
									<Summary
										leftText={'Send:'}
										rightText={`${sendAmount} sats`}
									/>
									<Summary leftText={'Fee:'} rightText={`${fee} sats`} />
								</View>
							</View>
						);
					}
				})}
		</>
	);
};

const updateOpacity = ({
	opacity = new Animated.Value(0),
	toValue = 0,
	duration = 1000,
}): void => {
	try {
		Animated.timing(opacity, {
			toValue,
			duration,
			easing: Easing.inOut(Easing.ease),
		}).start();
	} catch {}
};

interface ISendOnChainTransaction {
	animate?: boolean;
	header?: boolean;
	onComplete?: Function;
}
const SendOnChainTransaction = ({
	animate = true,
	header = true,
	onComplete = (): null => null,
}: ISendOnChainTransaction): ReactElement => {
	const [opacity] = useState(new Animated.Value(0));
	//const [spendMaxAmount, setSpendMaxAmount] = useState(false);
	const [rawTx, setRawTx] = useState('');

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

	const changeAddress = useSelector(
		(store: Store) =>
			store.wallet.wallets[selectedWallet]?.changeAddressIndex[selectedNetwork]
				?.address || ' ',
	);

	const selectedCurrency = useSelector(
		(state: Store) => state.settings.selectedCurrency,
	);

	const exchangeRate = useSelector((state: Store) => state.wallet.exchangeRate);

	useEffect(() => {
		if (animate) {
			setTimeout(() => {
				updateOpacity({ opacity, toValue: 1 });
			}, 100);
		}
		setupOnChainTransaction({
			selectedWallet,
			selectedNetwork,
		});
		return (): void => {
			if (animate) {
				updateOpacity({ opacity, toValue: 0, duration: 0 });
			}
			resetOnChainTransaction({ selectedNetwork, selectedWallet });
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const { outputs, message } = transaction;
	const totalFee = transaction.fee;

	/*
	 * Retreives total value of all outputs. Excludes change address.
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

	const getFiatAmount = useCallback((): string => {
		return getFiatBalance({
			balance: amount,
			exchangeRate,
			selectedCurrency,
		});
	}, [amount, exchangeRate, selectedCurrency]);
	const fiatAmount = getFiatAmount();

	const getFiatTotalFee = useCallback((): string => {
		return getFiatBalance({
			balance: totalFee,
			exchangeRate,
			selectedCurrency,
		});
	}, [totalFee, exchangeRate, selectedCurrency]);
	const fiatTotalFee = getFiatTotalFee();

	const getTransactionTotal = useCallback((): number => {
		try {
			return Number(amount) + Number(totalFee);
		} catch {
			return Number(totalFee);
		}
	}, [amount, totalFee]);

	const transactionTotal = getTransactionTotal();

	const getFiatTransactionTotal = useCallback((): string => {
		return getFiatBalance({
			balance: transactionTotal,
			exchangeRate,
			selectedCurrency,
		});
	}, [transactionTotal, exchangeRate, selectedCurrency]);

	const fiatTransactionTotal = getFiatTransactionTotal();

	const _createTransaction = async (): Promise<void> => {
		try {
			const response = await createTransaction({
				selectedNetwork,
				selectedWallet,
			});
			if (response.isOk()) {
				if (__DEV__) {
					console.log(response.value);
				}
				setRawTx(response.value);
			}
		} catch {}
	};

	LayoutAnimation.easeInEaseOut();

	if (rawTx) {
		return (
			<>
				<OutputSummary
					outputs={outputs}
					changeAddress={changeAddress}
					sendAmount={getTransactionOutputValue({})}
					fee={totalFee}
				/>
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
		<View
			color={header ? 'background' : 'transparent'}
			//eslint-disable-next-line react-native/no-inline-styles
			style={{ flex: header ? 1 : 0 }}>
			{header && <NavigationHeader title="Send Transaction" />}
			<AnimatedView color="transparent" style={[styles.container, { opacity }]}>
				<SendForm />
				<View color="transparent" style={styles.summary}>
					<Summary
						leftText={'Amount:'}
						rightText={`${amount} sats\n$${fiatAmount}`}
					/>
					<Summary
						leftText={'Fee:'}
						rightText={`${totalFee} sats\n$${fiatTotalFee}`}
					/>
					<Summary
						leftText={'Total:'}
						rightText={`${transactionTotal} sats\n$${fiatTransactionTotal}`}
					/>
				</View>
				<Button
					disabled={balance < transactionTotal}
					color="onSurface"
					text="Create"
					onPress={_createTransaction}
				/>
			</AnimatedView>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		marginVertical: 20,
		justifyContent: 'space-between',
	},
	title: {
		...systemWeights.bold,
		fontSize: 16,
		textAlign: 'center',
		padding: 5,
	},
	addressText: {
		textAlign: 'center',
	},
	row: {
		flexDirection: 'row',
		justifyContent: 'space-evenly',
	},
	summary: {
		marginVertical: 20,
	},
	summaryContainer: {
		marginVertical: 5,
	},
	summaryLeft: {
		flex: 1,
		alignItems: 'flex-end',
		marginRight: 10,
	},
	summaryRight: {
		flex: 1,
		alignItems: 'flex-start',
		marginLeft: 10,
	},
	broadcastButton: {
		width: '40%',
		borderRadius: 10,
		alignSelf: 'center',
		paddingVertical: 5,
	},
});

export default memo(SendOnChainTransaction);
