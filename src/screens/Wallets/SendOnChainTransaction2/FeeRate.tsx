import React, {
	memo,
	ReactElement,
	useMemo,
	useCallback,
	useState,
	useEffect,
} from 'react';
import { StyleSheet, View, Alert } from 'react-native';
import { useSelector } from 'react-redux';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Caption13Up, View as ThemedView } from '../../../styles/components';
import NavigationHeader from '../../../components/NavigationHeader';
import Button from '../../../components/Button';
import Store from '../../../store/types';
import { EFeeIds, IOnchainFees } from '../../../store/types/fees';
import { defaultFeesShape } from '../../../store/shapes/fees';
import { updateOnchainFeeEstimates } from '../../../store/actions/fees';
import { useTransactionDetails } from '../../../hooks/transaction';
import { getBalance } from '../../../utils/wallet';
import {
	getTotalFee,
	getTransactionOutputValue,
	updateFee,
} from '../../../utils/wallet/transactions';
import FeeItem from './FeeItem';

const FeeRate = ({ navigation }): ReactElement => {
	const insets = useSafeAreaInsets();
	const nextButtonContainer = useMemo(
		() => ({
			...styles.nextButtonContainer,
			paddingBottom: insets.bottom + 10,
		}),
		[insets.bottom],
	);
	const [feeEstimates, setFeeEstimates] = useState<IOnchainFees>(
		defaultFeesShape.onchain,
	);
	const [custom, setCustom] = useState(false);
	const selectedWallet = useSelector(
		(store: Store) => store.wallet.selectedWallet,
	);
	const selectedNetwork = useSelector(
		(store: Store) => store.wallet.selectedNetwork,
	);

	const balance = useMemo(
		() => getBalance({ selectedWallet, selectedNetwork, onchain: true }),
		[selectedNetwork, selectedWallet],
	);

	const transaction = useTransactionDetails();

	const selectedFeeId = useMemo(
		() => transaction?.selectedFeeId,
		[transaction?.selectedFeeId],
	);

	const transactionTotal = useCallback(() => {
		return getTransactionOutputValue({
			selectedWallet,
			selectedNetwork,
			outputs: transaction.outputs,
		});
	}, [selectedNetwork, selectedWallet, transaction.outputs]);

	const satsPerByte = useMemo((): number => {
		try {
			return transaction?.satsPerByte || 1;
		} catch (e) {
			return 1;
		}
	}, [transaction?.satsPerByte]);

	const getFee = useCallback(
		(_satsPerByte = 1) => {
			const message = transaction?.message;
			return getTotalFee({
				satsPerByte: _satsPerByte,
				message,
				selectedWallet,
				selectedNetwork,
			});
		},
		[selectedNetwork, selectedWallet, transaction?.message],
	);

	const _updateFee = useCallback(
		(feeId, _satsPerByte) => {
			const res = updateFee({
				selectedWallet,
				selectedNetwork,
				transaction,
				satsPerByte: _satsPerByte,
				selectedFeeId: feeId,
			});
			if (res.isErr()) {
				return Alert.alert('Fee update error', res.error.message);
			}
			if (custom) {
				setCustom(false);
			}
		},
		[custom, selectedNetwork, selectedWallet, transaction],
	);

	const displayInstant = useMemo(() => false, []); //TODO: Determine if the user can pay via Lightning.
	const displayFast = useMemo(() => {
		return balance.satoshis > transactionTotal() + getFee(feeEstimates.fast);
	}, [balance.satoshis, feeEstimates.fast, getFee, transactionTotal]);
	const displayNormal = useMemo(
		() =>
			balance.satoshis > transactionTotal() + getFee(feeEstimates.normal) &&
			feeEstimates.fast > feeEstimates.normal,
		[
			balance.satoshis,
			feeEstimates.fast,
			feeEstimates.normal,
			getFee,
			transactionTotal,
		],
	);
	const displaySlow = useMemo(
		() =>
			balance.satoshis > transactionTotal() + getFee(feeEstimates.slow) &&
			feeEstimates.normal > feeEstimates.slow,
		[
			balance.satoshis,
			feeEstimates.normal,
			feeEstimates.slow,
			getFee,
			transactionTotal,
		],
	);
	const displayCustom = useMemo(
		() => balance.satoshis > transactionTotal() + getFee(1),
		[balance.satoshis, getFee, transactionTotal],
	);

	const isSelected = useCallback(
		(id) => {
			return id === selectedFeeId;
		},
		[selectedFeeId],
	);

	const onCardPress = useCallback(
		async (feeId: EFeeIds, fee = 1) => {
			await _updateFee(feeId, fee);
		},
		[_updateFee],
	);

	const onCustomPress = useCallback(() => {
		// If the custom option is already selected and the user taps it, close the view.
		if (selectedFeeId === EFeeIds.custom) {
			toggleView({
				view: 'feePicker',
				data: {
					isOpen: false,
				},
			}).then();
		}
		onCardPress(EFeeIds.custom, satsPerByte).then();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [satsPerByte, selectedFeeId]);

	useEffect(() => {
		updateFeeEstimates().then();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const updateFeeEstimates = useCallback(async () => {
		const response = await updateOnchainFeeEstimates({ selectedNetwork });
		setFeeEstimates(response);
	}, [selectedNetwork]);

	return (
		<ThemedView color="onSurface" style={styles.container}>
			<NavigationHeader title="Speed" size="sm" />
			<View style={styles.content}>
				<Caption13Up color="gray1" style={styles.title}>
					SPEED AND FEE
				</Caption13Up>

				{displayInstant && (
					<FeeItem
						id={EFeeIds.instant}
						sats={0}
						onPress={(): void => {}}
						isSelected={false}
					/>
				)}
				{displayFast && (
					<FeeItem
						id={EFeeIds.fast}
						sats={getFee(feeEstimates.fast)}
						onPress={(): void => {
							onCardPress(EFeeIds.fast, feeEstimates.fast).then();
						}}
						isSelected={isSelected(EFeeIds.fast)}
					/>
				)}
				{displayNormal && (
					<FeeItem
						id={EFeeIds.normal}
						sats={getFee(feeEstimates.normal)}
						onPress={(): void => {
							onCardPress(EFeeIds.normal, feeEstimates.normal).then();
						}}
						isSelected={isSelected(EFeeIds.normal)}
					/>
				)}
				{displaySlow && (
					<FeeItem
						id={EFeeIds.slow}
						sats={getFee(feeEstimates.slow)}
						onPress={(): void => {
							onCardPress(EFeeIds.slow, feeEstimates.slow).then();
						}}
						isSelected={isSelected(EFeeIds.slow)}
					/>
				)}
				{displayCustom && (
					<FeeItem
						id={EFeeIds.custom}
						sats={selectedFeeId === EFeeIds.custom ? getFee(satsPerByte) : 0}
						onPress={onCustomPress}
						isSelected={isSelected(EFeeIds.custom)}
					/>
				)}
				<View style={nextButtonContainer}>
					<Button
						size="lg"
						text="Next"
						disabled={
							selectedFeeId === EFeeIds.none || selectedFeeId === EFeeIds.custom
						}
						onPress={(): void => navigation.navigate('ReviewAndSend')}
					/>
				</View>
			</View>
		</ThemedView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	content: {
		flex: 1,
	},
	title: {
		marginBottom: 16,
		marginLeft: 16,
	},
	nextButtonContainer: {
		flex: 1,
		justifyContent: 'flex-end',
		paddingHorizontal: 16,
		minHeight: 100,
	},
});

export default memo(FeeRate);
