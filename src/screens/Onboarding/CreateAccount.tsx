import React, { ReactElement, useState } from 'react';
import { Text, View } from '../../styles/components';
import { StyleSheet } from 'react-native';
import RegisterForm from '../../screens/Settings/Backup/RegisterForm';
import { createNewWallet } from '../../utils/startup';
import { showErrorNotification } from '../../utils/notifications';
import LoadingWalletScreen from './Loading';

const OnboardingCreateAccountScreen = (): ReactElement => {
	const [isCreatingWallet, setIsCreatingWallet] = useState(false);

	if (isCreatingWallet) {
		return <LoadingWalletScreen />;
	}

	return (
		<View style={styles.container}>
			<View style={styles.content}>
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
