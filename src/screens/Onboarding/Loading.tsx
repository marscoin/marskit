import React, { ReactElement } from 'react';
import { Text, View } from '../../styles/components';
import { ActivityIndicator, StyleSheet } from 'react-native';

const LoadingWalletScreen = (): ReactElement => {
	return (
		<View style={styles.container}>
			<View style={styles.content}>
				<View style={styles.loadingContent}>
					<Text style={styles.loadingText}>
						Setting up wallet. This can take a few moments.
					</Text>
					<ActivityIndicator />
				</View>
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
		margin: 20,
	},
	loadingContent: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
	},
	loadingText: {
		marginBottom: 20,
	},
});

export default LoadingWalletScreen;
