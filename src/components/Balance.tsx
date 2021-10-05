import React, { memo, ReactElement } from 'react';
import { Display, Title, View } from '../styles/components';
import { StyleSheet } from 'react-native';
import { abbreviateNumber } from '../utils/helpers';
import useDisplayValues from '../hooks/displayValues';

/**
 * Displays the total available balance for the current wallet & network.
 */
const Balance = ({ sats = 0 }): ReactElement => {
	const { fiatWhole, fiatDecimal, fiatDecimalValue, fiatSymbol } =
		useDisplayValues(sats);
	if (fiatWhole.length > 12) {
		const { newValue, abbreviation } = abbreviateNumber(fiatWhole);
		return (
			<View style={styles.row}>
				<Title style={styles.title} color="gray">
					{fiatSymbol}
				</Title>
				<Display size={'54px'}>{newValue}</Display>
				<Title style={styles.title} color="gray">
					{abbreviation}
				</Title>
			</View>
		);
	}
	return (
		<View style={styles.row}>
			<Title style={styles.title} color="gray">
				{fiatSymbol}
			</Title>
			<Display size={'54px'}>{fiatWhole}</Display>
			<Title style={styles.title} color="gray">
				{fiatDecimal}
				{fiatDecimalValue}
			</Title>
		</View>
	);
};

const styles = StyleSheet.create({
	row: {
		flexDirection: 'row',
	},
	title: {
		top: 7,
		paddingHorizontal: 5,
	},
});

export default memo(Balance);
