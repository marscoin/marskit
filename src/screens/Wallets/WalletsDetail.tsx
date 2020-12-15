import React, { memo } from 'react';
import { Text, View } from '../../styles/components';
import { StyleSheet } from 'react-native';
import NavigationHeader from '../../components/NavigationHeader';

const WalletsDetail = () => {
	return (
		<View style={styles.container}>
			<NavigationHeader title="Wallets Detail" />
			<View style={styles.content}>
				<Text>Wallets Detail</Text>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	content: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
});

export default memo(WalletsDetail);
