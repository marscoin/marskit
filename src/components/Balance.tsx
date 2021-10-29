import React, { memo, ReactElement } from 'react';
import { Headline, View } from '../styles/components';
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
				<Headline size={'34px'} color="gray">
					{fiatSymbol}
				</Headline>
				<Headline size={'34px'}>{newValue}</Headline>
				<Headline size={'34px'} color="gray">
					{abbreviation}
				</Headline>
			</View>
		);
	}
	return (
		<View style={styles.row}>
			<Headline size={'34px'} color="gray">
				{fiatSymbol}
			</Headline>
			<Headline size={'34px'}>{fiatWhole}</Headline>
			<Headline size={'34px'} color="gray">
				{fiatDecimal}
				{fiatDecimalValue}
			</Headline>
		</View>
	);
};

const styles = StyleSheet.create({
	row: {
		flexDirection: 'row',
	},
});

export default memo(Balance);
