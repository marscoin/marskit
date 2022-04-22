import React, { memo, ReactElement } from 'react';
import { DisplayHaas, View } from '../styles/components';
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
				<DisplayHaas color="gray">{fiatSymbol}</DisplayHaas>
				<DisplayHaas>{newValue}</DisplayHaas>
				<DisplayHaas color="gray">{abbreviation}</DisplayHaas>
			</View>
		);
	}
	return (
		<View style={styles.row}>
			<DisplayHaas color="gray">{fiatSymbol}</DisplayHaas>
			<DisplayHaas>{fiatWhole}</DisplayHaas>
			<DisplayHaas color="gray">
				{fiatDecimal}
				{fiatDecimalValue}
			</DisplayHaas>
		</View>
	);
};

const styles = StyleSheet.create({
	row: {
		flexDirection: 'row',
		marginTop: 5,
	},
});

export default memo(Balance);
