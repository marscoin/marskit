import React, { memo, ReactElement, useEffect, useState } from 'react';
import { StyleSheet, Switch, TextInput } from 'react-native';
import { View, Text } from '../../../styles/components';
import NavigationHeader from '../../../components/NavigationHeader';
import Button from '../../../components/Button';
import { useSelector } from 'react-redux';
import Store from '../../../store/types';
import themes from '../../../styles/themes';
import { showErrorNotification } from '../../../utils/notifications';
import { backpackPassword } from '../../../utils/backup/backpack';
import {
	cleanupBackupFiles,
	createBackupFile,
} from '../../../utils/backup/backup';
import Share from 'react-native-share';

const ExportBackups = (): ReactElement => {
	const [isEncrypted, setIsEncrypted] = useState<boolean>(true);
	const [isCreating, setIsCreating] = useState<boolean>(false);
	const [password, setPassword] = useState<string>('');

	useEffect(() => {
		backpackPassword().then(setPassword);

		return (): void => {
			cleanupBackupFiles().catch((e) => alert(JSON.stringify(e)));
		};
	}, []);

	const themeColors = useSelector(
		(state: Store) => themes[state.settings.theme].colors,
	);

	const shareToFiles = async (filePath): Promise<void> => {
		const shareOptions = {
			title: 'Share backup file',
			failOnCancel: false,
			saveToFiles: true,
			urls: [filePath],
		};

		try {
			await Share.open(shareOptions);
		} catch (error) {
			if (JSON.stringify(error).indexOf('CANCELLED') < 0) {
				showErrorNotification({
					title: 'Error',
					message: 'Failed to save backup file',
				});
			}
		}
	};

	const onCreateBackup = async (): Promise<void> => {
		if (isEncrypted && !password) {
			return showErrorNotification({
				title: 'Unable to create backup',
				message: 'Password must be set for encrypted backup',
			});
		}

		setIsCreating(true);

		const fileRes = await createBackupFile(isEncrypted ? password : undefined);
		if (fileRes.isErr()) {
			setIsCreating(false);
			return showErrorNotification({
				title: 'Failed to create backup file',
				message: fileRes.error.message,
			});
		}

		await shareToFiles(fileRes.value);

		setIsCreating(false);
	};

	return (
		<View style={styles.container}>
			<NavigationHeader title="Backup Export" />
			<View style={styles.content}>
				<View style={styles.row}>
					<Text style={styles.text}>Encrypt backup</Text>
					<Switch
						ios_backgroundColor={themeColors.surface}
						onValueChange={(): void => setIsEncrypted(!isEncrypted)}
						value={isEncrypted}
					/>
				</View>

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

						<Text style={styles.text2}>
							(Default password is your Backpack password)
						</Text>
					</View>
				) : null}

				<Button
					disabled={isCreating}
					style={styles.button}
					text={'Create backup file'}
					onPress={onCreateBackup}
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
		padding: 20,
	},
	row: {
		flexDirection: 'row',

		paddingVertical: 10,
		justifyContent: 'space-between',
		display: 'flex',
	},
	text: {
		flex: 1,
	},
	text2: {
		textAlign: 'center',
	},
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
	button: {
		marginTop: 40,
	},
});

export default memo(ExportBackups);
