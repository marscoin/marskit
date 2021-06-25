import React, { ReactElement, useState } from 'react';
import { ActivityIndicator, StyleSheet, TextInput } from 'react-native';
import DocumentPicker from 'react-native-document-picker';
import { Text, View } from '../../styles/components';
import { startWalletServices } from '../../utils/startup';
import {
	showErrorNotification,
	showSuccessNotification,
} from '../../utils/notifications';
import Button from '../../components/Button';
import {
	restoreFromEncryptedZip,
	restoreFromFile,
} from '../../utils/backup/backup';

const OnboardingRestoreFromFileScreen = ({ navigation }): ReactElement => {
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [isEncrypted, setIsEncrypted] = useState<boolean>(false);
	const [fileName, setFileName] = useState<string>('');
	const [fileUri, setFileUri] = useState<string>('');
	const [password, setPassword] = useState<string>('');

	const onRestore = async (): Promise<void> => {
		if (isEncrypted) {
			const restoreRes = await restoreFromEncryptedZip(fileUri, password);
			if (restoreRes.isErr()) {
				return showErrorNotification({
					title: 'Restore failed',
					message: restoreRes.error.message,
				});
			}
		} else {
			const restoreRes = await restoreFromFile(fileUri);
			if (restoreRes.isErr()) {
				return showErrorNotification({
					title: 'Restore failed',
					message: restoreRes.error.message,
				});
			}
		}

		showSuccessNotification({
			title: 'Success',
			message: 'Wallet is being restored',
		});

		await startWalletServices();
	};

	const openFiles = async (): Promise<void> => {
		setIsLoading(true);

		try {
			const res = await DocumentPicker.pick({
				type: [DocumentPicker.types.allFiles],
				copyTo: 'documentDirectory',
			});

			if (res.type === 'application/json') {
				setIsEncrypted(false);
			} else if (res.type === 'application/zip') {
				setIsEncrypted(true);
			} else {
				return showErrorNotification({
					title: 'Restore failed',
					message: 'Invalid filetype',
				});
			}

			setFileName(res.name);
			setFileUri(res.fileCopyUri);
		} catch (e) {
			if (!DocumentPicker.isCancel(e)) {
				showErrorNotification({
					title: 'Restore failed',
					message: 'Could not load files',
				});
			}
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<View style={styles.container}>
			<View style={styles.content}>
				<Text style={styles.title}>Restore from file</Text>

				{isLoading ? <ActivityIndicator /> : null}

				<Text style={styles.filename}>{fileName}</Text>

				<View style={isLoading ? styles.hiddenForm : null}>
					{isEncrypted ? (
						<View>
							<TextInput
								textAlignVertical={'center'}
								underlineColorAndroid="transparent"
								style={styles.textInput}
								placeholder="Password"
								autoCapitalize="none"
								autoCompleteType="off"
								autoCorrect={false}
								onChangeText={setPassword}
								value={password}
								textContentType={'newPassword'}
								secureTextEntry
							/>
						</View>
					) : null}

					{fileUri ? (
						<Button
							style={styles.button}
							text={'Restore'}
							onPress={onRestore}
						/>
					) : (
						<Button
							style={styles.button}
							text={'Open files'}
							onPress={openFiles}
						/>
					)}

					<Button
						style={styles.button}
						text={'Cancel'}
						onPress={navigation.goBack}
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
		margin: 20,
	},
	title: {
		fontSize: 24,
		marginBottom: 50,
		textAlign: 'center',
	},
	filename: {
		fontSize: 16,
		marginBottom: 20,
		textAlign: 'center',
	},
	hiddenForm: {
		display: 'none',
	},
	button: {},
	textInput: {
		minHeight: 50,
		borderRadius: 5,
		fontWeight: 'bold',
		fontSize: 18,
		textAlign: 'center',
		color: 'gray',
		borderBottomWidth: 1,
		borderColor: 'gray',
		paddingHorizontal: 10,
		backgroundColor: 'white',
		marginVertical: 5,
	},
});

export default OnboardingRestoreFromFileScreen;
