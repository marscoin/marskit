import { Text, View } from '../../styles/components';
import React, { memo } from 'react';
import { StyleSheet } from 'react-native';

const WalletListItem = ({ title, network, balance, fiatBalance }) => {
	return (
		<View style={styles.container}>
			<View>
				<Text>{title}</Text>
				<Text>{network}</Text>
			</View>
			<View>
				<Text>{balance}</Text>
				<Text>${fiatBalance}</Text>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		display: 'flex',
		flexDirection: 'row',
		justifyContent: 'space-between',
	},
});

export default memo(WalletListItem);
