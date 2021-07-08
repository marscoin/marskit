import React, { ReactElement, useState } from 'react';
import { Text, View } from '../../styles/components';
import { ActivityIndicator, StyleSheet } from 'react-native';
import RegisterForm from '../../screens/Settings/Backup/RegisterForm';
import { startWalletServices } from '../../utils/startup';
import {
	showErrorNotification,
	showInfoNotification,
} from '../../utils/notifications';
import { restoreWalletFromServer } from '../../utils/backup/backup';

const OnboardingRestoreAccountScreen = (): ReactElement => {
	const [isRestoring, setIsRestoring] = useState<boolean>(false);

	return (
		<View style={styles.container}>
			<View style={styles.content}>
				<Text style={styles.title}>Restore Account</Text>

				{isRestoring ? <ActivityIndicator /> : null}

				<View style={isRestoring ? styles.hiddenForm : null}>
					<RegisterForm
						onAuthDetails={async (auth): Promise<void> => {
							setIsRestoring(true);
							const res = await restoreWalletFromServer(auth);
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

							await startWalletServices({});

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
	hiddenForm: {
		display: 'none',
	},
});

export default OnboardingRestoreAccountScreen;
