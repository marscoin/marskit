import React, { memo, ReactElement, useEffect, useState } from 'react';
import { LayoutAnimation, Platform, StyleSheet, TextInput } from 'react-native';
import {
	View,
	AnimatedView,
	EvilIcon,
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
	getTotalFee,
} from '../../utils/wallet/transactions';
import { validateAddress } from '../../utils/scanner';
import { updateOnChainTransaction } from '../../store/actions/wallet';

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

	const addressType = useSelector(
		(store: Store) =>
			store.wallet.wallets[selectedWallet].addressType[selectedNetwork],
	);

	const changeAddress = useSelector(
		(store: Store) =>
			store.wallet.wallets[selectedWallet].changeAddressIndex[selectedNetwork]
				.address,
	);

	const transaction = useSelector(
		(store: Store) =>
			store.wallet.wallets[selectedWallet].transaction[selectedNetwork],
	);
	const { address, amount, fee, message } = transaction;

	useEffect(() => {
		if (animate) {
			setTimeout(() => {
				updateOpacity({ opacity, toValue: 1 });
			}, 100);
			return (): void => {
				updateOpacity({ opacity, toValue: 0, duration: 0 });
			};
		}
	}, []);

	const increaseFee = (): void => {
		try {
			//Check that the user has enough funds

			//Increase the fee
			updateTransaction({ fee: fee + 1 });
		} catch {}
	};

	const decreaseFee = (): void => {
		try {
			if (fee > 1) {
				//Decrease the fee
				updateTransaction({ fee: fee - 1 });
			}
		} catch {}
	};

	const getAmount = (): string => {
		try {
			return amount ? amount : '0';
		} catch {
			return '0';
		}
	};

	const totalFee = getTotalFee({ fee, message });

	const getTransactionTotal = (): number => {
		try {
			return Number(amount) + Number(totalFee);
		} catch {
			return Number(fee);
		}
	};

	const _createTransaction = async (): Promise<void> => {
		try {
			if (!address) {
				// eslint-disable-next-line no-alert
				alert('Please add an address');
				return;
			}
			if (!validateAddress({ address, selectedNetwork }).isValid) {
				alert('Please add a valid address');
				return;
			}
			if (!amount) {
				alert('Please add an amount to send.');
				return;
			}

			const response = await createTransaction({
				address,
				amount: Number(amount),
				message,
				changeAddress,
				selectedNetwork,
				fee,
				wallet: selectedWallet,
				addressType,
			});
			if (response.isOk()) {
				if (__DEV__) {
					console.log(response.value);
				}
				setRawTx(response.value.rawTx);
			}
		} catch {}
	};

	const updateTransaction = (data): void => {
		updateOnChainTransaction({
			selectedNetwork,
			selectedWallet,
			transaction: data,
		});
	};

	LayoutAnimation.easeInEaseOut();

	if (rawTx) {
		return (
			<View color="transparent" style={styles.summaryContainer}>
				<View color="transparent" style={styles.summary}>
					<Text style={styles.addressText}>Address:</Text>
					<Text style={styles.addressText}>{address}</Text>
					<Summary leftText={'Send:'} rightText={`${getAmount()} sats`} />
					<Summary leftText={'Fee:'} rightText={`${totalFee} sats`} />
					<Summary
						leftText={'Total:'}
						rightText={`${getTransactionTotal()} sats`}
					/>
				</View>
				<View color={'transparent'} style={styles.row}>
					<TouchableOpacity
						style={styles.broadcastButton}
						color={'onSurface'}
						onPress={async (): Promise<void> => setRawTx('')}>
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
							if (response.isOk()) {
								onComplete(response.value);
							}
						}}>
						<Text style={styles.title}>Broadcast</Text>
					</TouchableOpacity>
				</View>
			</View>
		);
	}

	return (
		<View
			color={header ? 'background' : 'transparent'}
			//eslint-disable-next-line react-native/no-inline-styles
			style={{ flex: header ? 1 : 0 }}>
			{header && <NavigationHeader title="SendOnChainTransaction" />}
			<AnimatedView color="transparent" style={[styles.container, { opacity }]}>
				<TextInput
					multiline={true}
					textAlignVertical={'center'}
					underlineColorAndroid="transparent"
					style={styles.multilineTextInput}
					placeholder="Address"
					autoCapitalize="none"
					autoCompleteType="off"
					autoCorrect={false}
					selectionColor="gray"
					onChangeText={(txt): void => updateTransaction({ address: txt })}
					value={address}
					onSubmitEditing={(): void => {}}
				/>
				<TextInput
					underlineColorAndroid="transparent"
					style={styles.textInput}
					placeholder="Amount (sats)"
					keyboardType="number-pad"
					autoCapitalize="none"
					autoCompleteType="off"
					autoCorrect={false}
					selectionColor="gray"
					onChangeText={(txt): void =>
						updateTransaction({ amount: Number(txt) })
					}
					value={amount ? amount.toString() : ''}
					onSubmitEditing={(): void => {}}
				/>
				<TextInput
					multiline
					underlineColorAndroid="transparent"
					style={styles.multilineTextInput}
					placeholder="Message (OP_RETURN)"
					autoCapitalize="none"
					autoCompleteType="off"
					autoCorrect={false}
					selectionColor="gray"
					onChangeText={(txt): void => updateTransaction({ message: txt })}
					value={message}
					onSubmitEditing={(): void => {}}
				/>

				<View color="transparent" style={styles.feeRow}>
					<TouchableOpacity onPress={decreaseFee} style={styles.icon}>
						<EvilIcon type="text2" name={'minus'} size={42} />
					</TouchableOpacity>
					<View color="transparent" style={styles.fee}>
						<Text style={styles.title}>{transaction.fee} sats/byte</Text>
					</View>
					<TouchableOpacity onPress={increaseFee} style={styles.icon}>
						<EvilIcon name={'plus'} size={42} />
					</TouchableOpacity>
				</View>

				<View color="transparent" style={styles.summary}>
					<Summary leftText={'Amount:'} rightText={`${getAmount()} sats`} />
					<Summary leftText={'Fee:'} rightText={`${totalFee} sats`} />
					<Summary
						leftText={'Total:'}
						rightText={`${getTransactionTotal()} sats`}
					/>
				</View>
				<Button color="onSurface" text="Create" onPress={_createTransaction} />
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
	icon: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		padding: 5,
		backgroundColor: 'transparent',
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
	feeRow: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		marginVertical: 5,
	},
	fee: {
		flex: 1.5,
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
