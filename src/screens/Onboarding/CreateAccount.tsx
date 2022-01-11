import React, { ReactElement, useState } from 'react';
import { Text, View } from '../../styles/components';
import { ActivityIndicator, StyleSheet } from 'react-native';
import RegisterForm from '../../screens/Settings/Backup/RegisterForm';
import { createNewWallet } from '../../utils/startup';
import { showErrorNotification } from '../../utils/notifications';

const OnboardingCreateAccountScreen = (): ReactElement => {
	const [isCreatingWallet, setIsCreatingWallet] = useState(true);

	return (
		<View style={styles.container}>
			<View style={styles.content}>
				{isCreatingWallet ? (
					<View style={styles.loadingContent}>
						<Text style={styles.loadingText}>
							Setting up wallet. This can take a few moments.
						</Text>
						<ActivityIndicator />
					</View>
				) : (
					<>
						<Text style={styles.title}>Create Account</Text>
						<RegisterForm
							onRegister={async (): Promise<void> => {
								setIsCreatingWallet(true);
								const res = await createNewWallet();
								if (res.isErr()) {
									setIsCreatingWallet(false);
									showErrorNotification({
										title: 'Wallet creation failed',
										message: res.error.message,
									});
								}
							}}
						/>
					</>
				)}
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
		// alignItems: 'center',
		margin: 20,
	},
	title: {
		fontSize: 24,
		marginBottom: 50,
		textAlign: 'center',
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

export default OnboardingCreateAccountScreen;
