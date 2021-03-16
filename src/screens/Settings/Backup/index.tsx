import React, { memo, ReactElement, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import {
	View,
	Feather,
	Text,
	TouchableOpacity,
	TextInput,
} from '../../../styles/components';
import Button from '../../../components/Button';
import { registerBackpack } from '../../../store/actions/backup';
import {
	showErrorNotification,
	showSuccessNotification,
} from '../../../utils/notifications';
import Store from '../../../store/types';

const BackupSettings = ({ navigation }): ReactElement => {
	const backupState = useSelector((state: Store) => state.backup);
	const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
	const [username, setUsername] = useState<string>(backupState.username);
	const [password, setPassword] = useState<string>('');

	const lastBackup = backupState.lastBackedUp
		? backupState.lastBackedUp.toLocaleString()
		: 'Never';

	const status =
		`Registered: ${backupState.username ? '✅' : '❌'}\n` +
		`Last backed up: ${lastBackup}\n` +
		`Synced: ${backupState.backpackSynced ? '✅' : '❌'}`;

	return (
		<View style={styles.container}>
			<TouchableOpacity
				activeOpacity={0.7}
				onPress={navigation.goBack}
				style={styles.row}>
				<Feather style={{}} name="arrow-left" size={30} />
				<Text style={styles.backText}>Backup</Text>
			</TouchableOpacity>
			<ScrollView>
				<Text style={styles.status}>{status}</Text>
				<TextInput
					textAlignVertical={'center'}
					underlineColorAndroid="transparent"
					style={styles.textInput}
					placeholder="Username"
					autoCapitalize="none"
					autoCompleteType="off"
					autoCorrect={false}
					onChangeText={setUsername}
					value={username}
				/>
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

				<Button
					text={isSubmitting ? 'Updating...' : 'Update'}
					disabled={isSubmitting}
					onPress={async (): Promise<void> => {
						setIsSubmitting(true);
						const registrationResult = await registerBackpack({
							username,
							password,
						});
						if (registrationResult.isErr()) {
							return showErrorNotification({
								title: 'Failed to register',
								message: registrationResult.error.message,
							});
						}

						showSuccessNotification({
							title: 'Success',
							message: 'Backup registered',
						});

						setIsSubmitting(false);
					}}
				/>
			</ScrollView>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	row: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingLeft: 10,
		paddingVertical: 8,
	},
	backText: {
		fontSize: 20,
	},
	status: {
		fontSize: 14,
		textAlign: 'center',
		marginBottom: 20,
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
});

export default memo(BackupSettings);
