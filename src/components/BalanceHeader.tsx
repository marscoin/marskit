import React, { memo, ReactElement } from 'react';
import { View, Caption13Up } from '../styles/components';
import { useBalance } from '../hooks/wallet';
import { StyleSheet } from 'react-native';
import Balance from './Balance';

/**
 * Displays the total available balance for the current wallet & network.
 */
const BalanceHeader = (): ReactElement => {
	const { satoshis } = useBalance({
		onchain: true,
		lightning: true,
	});
	return (
		<View style={styles.container}>
			<Caption13Up color="gray">TOTAL BALANCE</Caption13Up>
			<Balance sats={satoshis} />
		</View>
	);
};

export default memo(BalanceHeader);

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'flex-start',
		marginTop: 32,
		marginHorizontal: 16,
	},
});
