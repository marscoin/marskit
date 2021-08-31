import React, { memo, ReactElement, useCallback, useMemo } from 'react';
import { View, Text01M, Display, Title } from '../styles/components';
import { useBalance } from '../screens/Wallets/SendOnChainTransaction/WalletHook';
import { StyleSheet } from 'react-native';
import useDisplayValues from '../utils/exchange-rate/useDisplayValues';
import { abbreviateNumber } from '../utils/helpers';

/**
 * Displays the total available balance for the current wallet & network.
 */
const BalanceHeader = (): ReactElement => {
	const balance = useBalance();
	const { fiatFormatted, fiatSymbol } = useDisplayValues(balance ?? 0);
	const [whole, decimal] = useMemo(
		() => fiatFormatted.split('.'),
		[fiatFormatted],
	);

	const Balance = useCallback((): ReactElement => {
		if (whole?.length > 12) {
			const { newValue, abbreviation } = abbreviateNumber(whole);
			return (
				<>
					<Title style={styles.title} color="gray">
						{fiatSymbol}
					</Title>
					<Display size={54}>{newValue}</Display>
					<Title style={styles.title} color="gray">
						{abbreviation}
					</Title>
				</>
			);
		}
		return (
			<>
				<Title style={styles.title} color="gray">
					{fiatSymbol}
				</Title>
				<Display size={54}>{whole}</Display>
				<Title style={styles.title} color="gray">
					.{decimal}
				</Title>
			</>
		);
	}, [decimal, fiatSymbol, whole]);

	return (
		<View style={styles.container}>
			<Text01M color="gray">Total Balance</Text01M>
			<View style={styles.row}>
				<Balance />
			</View>
		</View>
	);
};

export default memo(BalanceHeader);

const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'flex-start',
		margin: 30,
	},
	row: {
		flexDirection: 'row',
	},
	title: {
		top: 7,
		paddingHorizontal: 5,
	},
});
