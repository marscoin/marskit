import React, { ReactElement } from 'react';
import { Text, View } from '../../styles/components';
import { StyleSheet } from 'react-native';
import RegisterForm from '../../screens/Settings/Backup/RegisterForm';
import { createNewWallet } from '../../utils/startup';
import { showErrorNotification } from '../../utils/notifications';

const OnboardingCreateAccountScreen = (): ReactElement => {
	return (
		<View style={styles.container}>
			<View style={styles.content}>
				<Text style={styles.title}>Create Account</Text>
				<RegisterForm
					onRegister={async (): Promise<void> => {
						const res = await createNewWallet();
						if (res.isErr()) {
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
});

export default OnboardingCreateAccountScreen;
