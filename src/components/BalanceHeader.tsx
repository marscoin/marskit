import React, { memo, ReactElement } from 'react';
import { View, Text01M } from '../styles/components';
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
		tether: true,
	});
	return (
		<View style={styles.container}>
			<Text01M color="gray">Total Balance</Text01M>
			<Balance sats={satoshis} />
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
});
