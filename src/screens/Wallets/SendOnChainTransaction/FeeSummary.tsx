import { defaultOnChainTransactionData } from '../../../store/types/wallet';
import React, { memo, ReactElement, useCallback } from 'react';
import Summary from './Summary';
import { LayoutAnimation, StyleSheet } from 'react-native';
import { getTransactionOutputValue } from '../../../utils/wallet/transactions';
import { useSelector } from 'react-redux';
import Store from '../../../store/types';
import { getFiatBalance } from '../../../utils/helpers';
import { View } from '../../../styles/components';

const FeeSummary = ({
	amount: _amount = '0',
	lightning = false,
}: {
	amount?: string | number;
	lightning?: boolean;
}): ReactElement => {
	const selectedWallet = useSelector(
		(store: Store) => store.wallet.selectedWallet,
	);
	const selectedNetwork = useSelector(
		(store: Store) => store.wallet.selectedNetwork,
	);

	const transaction = useSelector(
		(store: Store) =>
			store.wallet.wallets[selectedWallet]?.transaction[selectedNetwork] ||
			defaultOnChainTransactionData,
	);

	const selectedCurrency = useSelector(
		(state: Store) => state.settings.selectedCurrency,
	);

	const exchangeRate = useSelector((state: Store) => state.wallet.exchangeRate);

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

	const amount = Number(_amount) || getAmountToSend();

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

	LayoutAnimation.easeInEaseOut();
	return (
		<View color="transparent" style={styles.summary}>
			<Summary
				leftText={lightning ? 'Transfer' : 'Send:'}
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
	);
};

const styles = StyleSheet.create({
	summary: {
		marginVertical: 20,
	},
});

export default memo(FeeSummary);
