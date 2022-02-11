import React, { ReactElement } from 'react';
import { Text, View } from '../../styles/components';
import { StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';

const LoadingWalletScreen = (): ReactElement => {
	return (
		<View style={styles.container}>
			<View style={styles.loadingContent}>
				<View style={styles.loadingText}>
					<Text>Setting up wallet. This can take a few moments.</Text>
				</View>
				<View style={styles.loadingAnimation}>
					<LottieView
						autoPlay
						loop
						source={require('../../assets/animations/loading.json')}
					/>
				</View>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	loadingContent: {
		flex: 1,
	},
	loadingText: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	loadingAnimation: {
		flex: 2,
	},
});

export default LoadingWalletScreen;
