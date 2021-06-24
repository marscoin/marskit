import React, { memo, ReactElement, useEffect, useState } from 'react';
import { StyleSheet, Switch, TextInput } from 'react-native';
import { View, Text } from '../../../styles/components';
import NavigationHeader from '../../../components/NavigationHeader';
import Button from '../../../components/Button';
import { useSelector } from 'react-redux';
import Store from '../../../store/types';
import themes from '../../../styles/themes';
import {
	showErrorNotification,
	showSuccessNotification,
} from '../../../utils/notifications';
import { backpackPassword } from '../../../utils/backup/backpack';
import {
	cleanupBackupFiles,
	createBackupFile,
} from '../../../utils/backup/backup';

const ExportBackups = ({ navigation }): ReactElement => {
	const [isEncrypted, setIsEncrypted] = useState<boolean>(true);
	const [password, setPassword] = useState<string>('');

	useEffect(() => {
		backpackPassword().then(setPassword);
	}, []);

	const themeColors = useSelector(
		(state: Store) => themes[state.settings.theme].colors,
	);

	const onCreateBackup = async (): Promise<void> => {
		if (isEncrypted && !password) {
			return showErrorNotification({
				title: 'Unable to create backup',
				message: 'Password must be set for encrypted backup',
			});
		}

		const fileRes = await createBackupFile(isEncrypted ? password : undefined);
		if (fileRes.isErr()) {
			return showErrorNotification({
				title: 'Failed to create backup file',
				message: fileRes.error.message,
			});
		}

		showSuccessNotification({
			title: 'Backup created',
			message: fileRes.value,
		});
	};

	return (
		<View style={styles.container}>
			<NavigationHeader title="Backup Export" onGoBack={cleanupBackupFiles} />
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
