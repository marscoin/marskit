import React, { memo, ReactElement } from 'react';
import { Display, View } from '../styles/components';
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
				<Display color="gray">{fiatSymbol}</Display>
				<Display>{newValue}</Display>
				<Display color="gray">{abbreviation}</Display>
			</View>
		);
	}
	return (
		<View style={styles.row}>
			<Display color="gray">{fiatSymbol}</Display>
			<Display>{fiatWhole}</Display>
			<Display color="gray">
				{fiatDecimal}
				{fiatDecimalValue}
			</Display>
		</View>
	);
};

const styles = StyleSheet.create({
	row: {
		flexDirection: 'row',
		marginTop: 2,
	},
});

export default memo(Balance);
