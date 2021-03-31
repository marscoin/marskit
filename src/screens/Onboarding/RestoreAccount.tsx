import React, { ReactElement, useState } from 'react';
import { Text, View } from '../../styles/components';
import { ActivityIndicator, StyleSheet } from 'react-native';
import RegisterForm from '../../screens/Settings/Backup/RegisterForm';
import { restoreWallet } from '../../utils/startup';
import {
	showErrorNotification,
	showInfoNotification,
} from '../../utils/notifications';

const OnboardingRestoreAccountScreen = (): ReactElement => {
	const [isRestoring, setIsRestoring] = useState<boolean>(false);

	return (
		<View style={styles.container}>
			<View style={styles.content}>
				<Text style={styles.title}>Restore Account</Text>

				{isRestoring ? <ActivityIndicator /> : null}

				<View style={{ display: isRestoring ? 'none' : 'flex' }}>
					<RegisterForm
						onAuthDetails={async (auth): Promise<void> => {
							setIsRestoring(true);
							const res = await restoreWallet(auth);
							if (res.isErr()) {
								showErrorNotification({
									title: 'Wallet restore failed',
									message: res.error.message,
								});
								setIsRestoring(false);
								return;
							}

							showInfoNotification({
								title: 'Success',
								message: 'Wallet is being restored',
							});

							setIsRestoring(false);
						}}
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

export default OnboardingRestoreAccountScreen;
