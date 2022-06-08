import React, { memo, ReactElement } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import { Feather, Text, TouchableOpacity } from '../../../styles/components';
import Store from '../../../store/types';
import SafeAreaView from '../../../components/SafeAreaView';

const BackupSettings = ({ navigation }): ReactElement => {
	const backupState = useSelector((state: Store) => state.backup);

	const lastBackup = backupState.lastBackedUp
		? backupState.lastBackedUp.toLocaleString()
		: 'Never';

	const status =
		`Registered: ${backupState.username ? '✅' : '❌'}\n` +
		`Last backed up: ${lastBackup}\n` +
		`Synced: ${backupState.backpackSynced ? '✅' : '❌'}`;

	return (
		<SafeAreaView style={styles.container}>
			<TouchableOpacity
				activeOpacity={0.7}
				onPress={navigation.goBack}
				style={styles.row}>
				<Feather style={{}} name="arrow-left" size={30} />
				<Text style={styles.backText}>Backup</Text>
			</TouchableOpacity>
			<ScrollView>
				<Text style={styles.status}>{status}</Text>
			</ScrollView>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	container: {
		paddingHorizontal: 20,
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
