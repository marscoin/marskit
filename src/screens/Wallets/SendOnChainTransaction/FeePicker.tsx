import React, {
	memo,
	ReactElement,
	useCallback,
	useEffect,
	useMemo,
	useState,
} from 'react';
import { LayoutAnimation, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import Store from '../../../store/types';
import { ScrollView, Text01M, View } from '../../../styles/components';
import { useTransactionDetails } from '../../../hooks/transaction';
import {
	adjustFee,
	getTotalFee,
	getTransactionOutputValue,
	updateFee,
} from '../../../utils/wallet/transactions';
import AdjustValue from '../../../components/AdjustValue';
import FeePickerCard from './FeePickerCard';
import { getBalance } from '../../../utils/wallet';
import { EFeeIds, IOnchainFees } from '../../../store/types/fees';
import { toggleView } from '../../../store/actions/user';
import { defaultFeesShape, FeeText } from '../../../store/shapes/fees';
import { updateOnchainFeeEstimates } from '../../../store/actions/fees';

const FeePicker = ({
	onPress = (): null => null,
}: {
	onPress?: (feeId: EFeeIds, fee: number) => any;
}): ReactElement => {
	const [feeEstimates, setFeeEstimates] = useState<IOnchainFees>(
		defaultFeesShape.onchain,
	);
	const [custom, setCustom] = useState(false);
	const selectedNetwork = useSelector(
		(store: Store) => store.wallet.selectedNetwork,
	);
	const selectedWallet = useSelector(
		(store: Store) => store.wallet.selectedWallet,
	);

	useEffect(() => {
		updateFeeEstimates().then();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	LayoutAnimation.easeInEaseOut();

	const updateFeeEstimates = useCallback(async () => {
		const response = await updateOnchainFeeEstimates({ selectedNetwork });
		setFeeEstimates(response);
	}, [selectedNetwork]);

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

	const increaseFee = useCallback(() => {
		adjustFee({ selectedWallet, selectedNetwork, adjustBy: 1 });
	}, [selectedNetwork, selectedWallet]);
	const decreaseFee = useCallback(() => {
		adjustFee({ selectedWallet, selectedNetwork, adjustBy: -1 });
	}, [selectedNetwork, selectedWallet]);

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
			updateFee({
				selectedWallet,
				selectedNetwork,
				transaction,
				satsPerByte: _satsPerByte,
				selectedFeeId: feeId,
			});
			if (custom) {
				setCustom(false);
			}
		},
		[custom, selectedNetwork, selectedWallet, transaction],
	);

	const displayInstant = useMemo(() => {
		//TODO: Determine if the user can pay via Lightning.
		return true;
	}, []);
	const displayFast = useMemo(() => {
		return balance.satoshis > transactionTotal() + getFee(feeEstimates.fast);
	}, [balance.satoshis, feeEstimates.fast, getFee, transactionTotal]);
	const displayNormal = useMemo(() => {
		return (
			balance.satoshis > transactionTotal() + getFee(feeEstimates.normal) &&
			feeEstimates.fast > feeEstimates.normal
		);
	}, [
		balance.satoshis,
		feeEstimates.fast,
		feeEstimates.normal,
		getFee,
		transactionTotal,
	]);
	const displaySlow = useMemo(() => {
		return (
			balance.satoshis > transactionTotal() + getFee(feeEstimates.slow) &&
			feeEstimates.normal > feeEstimates.slow
		);
	}, [
		balance.satoshis,
		feeEstimates.normal,
		feeEstimates.slow,
		getFee,
		transactionTotal,
	]);
	const displayCustom = useMemo(() => {
		return balance.satoshis > transactionTotal() + getFee(1);
	}, [balance.satoshis, getFee, transactionTotal]);

	const isSelected = useCallback(
		(id) => {
			return id === selectedFeeId;
		},
		[selectedFeeId],
	);

	const onCardPress = useCallback(async (feeId: EFeeIds, fee = 1) => {
		await _updateFee(feeId, fee);
		if (feeId !== EFeeIds.custom) {
			toggleView({
				view: 'feePicker',
				data: {
					isOpen: false,
				},
			}).then();
		}
		onPress(feeId, fee);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

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

	return (
		<ScrollView color="transparent" style={styles.container}>
			<View color="transparent" style={styles.content}>
				<Text01M>Select Network Fee</Text01M>

				{displayInstant && (
					<FeePickerCard
						id={EFeeIds.instant}
						title={FeeText.instant.title}
						description={FeeText.instant.description}
					/>
				)}
				{displayFast && (
					<FeePickerCard
						id={EFeeIds.fast}
						title={FeeText.fast.title}
						description={FeeText.fast.description}
						sats={getFee(feeEstimates.fast)}
						onPress={(): void => {
							onCardPress(EFeeIds.fast, feeEstimates.fast).then();
						}}
						isSelected={isSelected(EFeeIds.fast)}
					/>
				)}
				{displayNormal && (
					<FeePickerCard
						id={EFeeIds.normal}
						title={FeeText.normal.title}
						description={FeeText.normal.description}
						sats={getFee(feeEstimates.normal)}
						onPress={(): void => {
							onCardPress(EFeeIds.normal, feeEstimates.normal).then();
						}}
						isSelected={isSelected(EFeeIds.normal)}
					/>
				)}
				{displaySlow && (
					<FeePickerCard
						id={EFeeIds.slow}
						title={FeeText.slow.title}
						description={FeeText.slow.description}
						sats={getFee(feeEstimates.slow)}
						onPress={(): void => {
							onCardPress(EFeeIds.slow, feeEstimates.slow).then();
						}}
						isSelected={isSelected(EFeeIds.slow)}
					/>
				)}
				{displayCustom && (
					<FeePickerCard
						id={EFeeIds.custom}
						title={FeeText.custom.title}
						description={
							selectedFeeId === EFeeIds.custom ? `${satsPerByte} sats/byte` : ''
						}
						sats={selectedFeeId === EFeeIds.custom ? getFee(satsPerByte) : 0}
						onPress={onCustomPress}
						isSelected={isSelected(EFeeIds.custom)}
					/>
				)}

				{selectedFeeId === EFeeIds.custom && (
					<AdjustValue
						value={`${satsPerByte} sats/byte`}
						decreaseValue={decreaseFee}
						increaseValue={increaseFee}
					/>
				)}
			</View>
		</ScrollView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		margin: 20,
	},
	content: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
	},
});

export default memo(FeePicker);
