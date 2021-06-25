import React, { ReactElement } from 'react';
import { Text, View } from '../../styles/components';
import { Alert, StyleSheet } from 'react-native';
import Button from '../../components/Button';
import { createNewWallet } from '../../utils/startup';
import { showErrorNotification } from '../../utils/notifications';
import DocumentPicker from 'react-native-document-picker';
import {
	restoreFromEncryptedZip,
	restoreFromFile,
} from '../../utils/backup/backup';

const OnboardingWelcomeScreen = ({
	navigation,
}: {
	navigation: any;
}): ReactElement => {
	const _restoreFromFile = async (uri: string): Promise<void> => {
		const restoreRes = await restoreFromFile(uri);
		if (restoreRes.isErr()) {
			showErrorNotification({
				title: 'Restore failed',
				message: restoreRes.error.message,
			});
		}
	};

	const _restoreFromEncryptedZip = async (uri: string): Promise<void> => {
		Alert.prompt('Restore', '', [
			{
				text: 'Restore',
				onPress: async (password): Promise<void> => {
					if (!password) {
						return;
					}

					const restoreRes = await restoreFromEncryptedZip(uri, password);
					if (restoreRes.isErr()) {
						showErrorNotification({
							title: 'Restore failed',
							message: restoreRes.error.message,
						});
					}
				},
			},
			{
				text: 'Cancel',
				onPress: (): void => {},
				style: 'cancel',
			},
		]);
	};

	const loadFiles = async (): Promise<void> => {
		try {
			const res = await DocumentPicker.pick({
				type: [DocumentPicker.types.allFiles],
				copyTo: 'documentDirectory',
			});

			if (!['application/json', 'application/zip'].includes(res.type)) {
				showErrorNotification({
					title: 'Restore failed',
					message: 'Invalid filetype',
				});
			}

			switch (res.type) {
				case 'application/json': {
					await _restoreFromFile(res.fileCopyUri);
					break;
				}
				case 'application/zip': {
					await _restoreFromEncryptedZip(res.fileCopyUri);
					break;
				}
				default: {
					showErrorNotification({
						title: 'Restore failed',
						message: 'Invalid filetype',
					});
				}
			}
		} catch (e) {
			if (!DocumentPicker.isCancel(e)) {
				showErrorNotification({
					title: 'Restore failed',
					message: 'Could not load files',
				});
			}
		}
	};

	const onRestorePress = (): void => {
		Alert.alert('Restore', '', [
			{
				text: 'From backup server',
				onPress: (): void => navigation.navigate('RestoreAccount'),
			},
			{
				text: 'From file',
				onPress: loadFiles,
			},
			{
				text: 'Cancel',
				onPress: (): void => {},
				style: 'cancel',
			},
		]);
	};

	return (
		<View style={styles.container}>
			<View style={styles.content}>
				<Text style={styles.title}>Welcome</Text>

				<Button
					style={styles.button}
					text={'Create new account'}
					onPress={(): void => {
						navigation.navigate('CreateAccount');
					}}
				/>
				<Button
					style={styles.button}
					text={'Restore'}
					onPress={onRestorePress}
				/>
				<Button
					style={styles.button}
					text={'Skip (no automated backups)'}
					onPress={async (): Promise<void> => {
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
	},
	title: {
		fontSize: 24,
		marginBottom: 50,
		textAlign: 'center',
	},
	button: {
		marginTop: 10,
	},
});

export default OnboardingWelcomeScreen;
