import React, { memo, ReactElement, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import {
	View,
	Feather,
	Text,
	TouchableOpacity,
} from '../../../styles/components';
import Button from '../../../components/Button';
import {
	showErrorNotification,
	showSuccessNotification,
} from '../../../utils/notifications';
import Store from '../../../store/types';
import { verifyFromBackpackServer } from '../../../utils/backup/backup';
import BackupRegisterForm from './RegisterForm';

const BackupSettings = ({ navigation }): ReactElement => {
	const backupState = useSelector((state: Store) => state.backup);
	const [isVerifying, setIsVerifying] = useState<boolean>(false);

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

				{!backupState.username ? <BackupRegisterForm /> : null}

				<Button
					text={isVerifying ? 'Verifying...' : 'Verify backup'}
					disabled={isVerifying}
					onPress={async (): Promise<void> => {
						setIsVerifying(true);
						const verifyResult = await verifyFromBackpackServer();
						if (verifyResult.isErr()) {
							showErrorNotification({
								title: 'Failed to verify backup',
								message: verifyResult.error.message,
							});
						} else {
							showSuccessNotification({
								title: 'Success',
								message: 'Backup verified',
							});
						}

						setIsVerifying(false);
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
