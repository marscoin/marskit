import React, { memo, ReactElement, useState } from 'react';
import { StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import { TextInput } from '../../../styles/components';
import Button from '../../../components/Button';
import { registerBackpack } from '../../../store/actions/backup';
import {
	showErrorNotification,
	showSuccessNotification,
} from '../../../utils/notifications';
import Store from '../../../store/types';
import { IBackpackAuth } from '../../../utils/backup/backpack';

/**
 * Either restore or creates a new account.
 * Pass onRegister to trigger a backup account creation. Pass onAuthDetails to just get user auth details from inputs.
 * @param onRegister
 * @param onAuthDetails
 * @returns {JSX.Element}
 * @constructor
 */
const BackupRegisterForm = ({
	onRegister,
	onAuthDetails,
}: {
	onRegister?: () => void;
	onAuthDetails?: (auth: IBackpackAuth) => void;
}): ReactElement => {
	const backupState = useSelector((state: Store) => state.backup);
	const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
	const [username, setUsername] = useState<string>(backupState.username);
	const [password, setPassword] = useState<string>('');

	return (
		<>
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

			{onRegister ? (
				<Button
					text={isSubmitting ? 'Registering...' : 'Register'}
					disabled={isSubmitting}
					onPress={async (): Promise<void> => {
						setIsSubmitting(true);
						const registrationResult = await registerBackpack({
							username,
							password,
						});

						if (registrationResult.isErr()) {
							showErrorNotification({
								title: 'Failed to register',
								message: registrationResult.error.message,
							});
						} else {
							onRegister();
						}

						setIsSubmitting(false);
					}}
				/>
			) : null}

			{onAuthDetails ? (
				<Button
					text="Retrieve"
					disabled={isSubmitting}
					onPress={async (): Promise<void> => {
						onAuthDetails({
							username,
							password,
						});
					}}
				/>
			) : null}
		</>
	);
};

const styles = StyleSheet.create({
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

export default memo(BackupRegisterForm);
