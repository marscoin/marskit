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
import BackupRegisterForm from './RegisterForm';
import { backupSetup, performFullBackup } from '../../../store/actions/backup';

const BackupSettings = ({ navigation }): ReactElement => {
	const backupState = useSelector((state: Store) => state.backup);
	const [isVerifying, setIsVerifying] = useState<boolean>(false);
	const [isBackingUp, setIsBackingUp] = useState<boolean>(false);

	const lastBackup = backupState.lastBackedUp
		? backupState.lastBackedUp.toLocaleString()
		: 'Never';

	const isRegistered = !!backupState.username;

	const status =
		`Registered: ${backupState.username ? '✅' : '❌'}\n` +
		`Last backed up: ${lastBackup}\n` +
		`Synced: ${backupState.backpackSynced ? '✅' : '❌'}`;

	const onVerify = async () => {
		setIsVerifying(true);
		const verifyResult = await backupSetup();
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
	};

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

				{!isRegistered ? <BackupRegisterForm onRegister={onVerify} /> : null}

				{isRegistered ? (
					<>
						<Button
							text={isVerifying ? 'Verifying...' : 'Verify backup'}
							disabled={isVerifying}
							onPress={onVerify}
						/>

						<Button
							text={isBackingUp ? 'Backing up...' : 'Backup now'}
							disabled={isBackingUp}
							onPress={async (): Promise<void> => {
								setIsBackingUp(true);
								const backupRes = await performFullBackup({
									retries: 0,
									retryTimeout: 0,
								});
								if (backupRes.isErr()) {
									showErrorNotification({
										title: 'Backup Failed',
										message: backupRes.error.message,
									});
								} else {
									showSuccessNotification({
										title: 'Success',
										message: 'Full backup complete',
									});
								}

								setIsBackingUp(false);
							}}
						/>
					</>
				) : null}
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
});

export default memo(BackupSettings);
