import React, { memo, ReactElement, useCallback } from 'react';
import { View, Text01M, Display, Title } from '../styles/components';
import { useBalance } from '../hooks/wallet';
import { StyleSheet } from 'react-native';
import { abbreviateNumber } from '../utils/helpers';

/**
 * Displays the total available balance for the current wallet & network.
 */
const BalanceHeader = (): ReactElement => {
	const { fiatWhole, fiatDecimal, fiatDecimalValue, fiatSymbol } = useBalance({
		onchain: true,
		lightning: true,
		omnibolt: true,
	});

	const Balance = useCallback((): ReactElement => {
		if (fiatWhole.length > 12) {
			const { newValue, abbreviation } = abbreviateNumber(fiatWhole);
			return (
				<>
					<Title style={styles.title} color="gray">
						{fiatSymbol}
					</Title>
					<Display size={'54px'}>{newValue}</Display>
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
				<Display size={'54px'}>{fiatWhole}</Display>
				<Title style={styles.title} color="gray">
					{fiatDecimal}
					{fiatDecimalValue}
				</Title>
			</>
		);
	}, [fiatWhole, fiatDecimal, fiatDecimalValue, fiatSymbol]);

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
		marginVertical: 30,
		marginHorizontal: 10,
	},
	row: {
		flexDirection: 'row',
	},
	title: {
		top: 7,
		paddingHorizontal: 5,
	},
});
