import React, { memo, ReactElement } from 'react';
import { StyleSheet } from 'react-native';
import { View, Feather, Text, TouchableOpacity } from '../../styles/components';
import Store from '../../store/types';
import { useDispatch, useSelector } from 'react-redux';
import { updateSettings } from '../../store/actions/settings';
import List from '../../components/List';

const Settings = ({ navigation }): ReactElement => {
	const dispatch = useDispatch();
	const settings = useSelector((state: Store) => state.settings);

	const updateTheme = (): void => {
		try {
			const theme = settings.theme === 'dark' ? 'light' : 'dark';
			dispatch(updateSettings({ theme }));
		} catch {}
	};

	const SettingsListData = [
		{
			title: 'Settings',
			data: [
				{
					title: 'Dark Mode',
					type: 'switch',
					enabled: settings.theme === 'dark',
					onPress: updateTheme,
				},
				{
					title: 'Fiat Currency Selection',
					type: 'button',
					onPress: (): void => navigation.navigate('TempSettings'),
				},
				{
					title: 'Security',
					type: 'button',
					onPress: (): void => navigation.navigate('TempSettings'),
				},
				{
					title: 'Biometrics',
					type: 'button',
					onPress: (): void => navigation.navigate('TempSettings'),
				},
				{
					title: 'Pin',
					type: 'button',
					onPress: (): void => navigation.navigate('TempSettings'),
				},
				{
					title: 'Two-Factor Authentication',
					type: 'button',
					onPress: (): void => navigation.navigate('TempSettings'),
				},
			],
		},
		{
			title: 'Lightning Debug',
			data: [
				{
					title: 'LND Logs',
					type: 'button',
					onPress: (): void => navigation.navigate('LndLogs'),
				},
				{
					title: 'Test commands',
					type: 'button',
					onPress: (): void => navigation.navigate('TempLightningOptions'),
				},
			],
		},
		{
			title: 'About',
			data: [
				{
					title: 'Twitter: @synonym_to',
					type: 'button',
					onPress: (): void => navigation.navigate('TempSettings'),
				},
				{
					title: 'Telegram',
					type: 'button',
					onPress: (): void => navigation.navigate('TempSettings'),
				},
				{
					title: 'Website: synonym.to',
					type: 'button',
					onPress: (): void => navigation.navigate('TempSettings'),
				},
				{
					title: 'Leave A Review',
					type: 'button',
					onPress: (): void => navigation.navigate('TempSettings'),
				},
				{
					title: 'Report A Bug',
					type: 'button',
					onPress: (): void => navigation.navigate('TempSettings'),
				},
				{
					title: 'Contribute',
					type: 'button',
					onPress: (): void => navigation.navigate('TempSettings'),
				},
				{
					title: 'Legal',
					type: 'button',
					onPress: (): void => navigation.navigate('TempSettings'),
				},
			],
		},
		{
			title: 'Support',
			data: [
				{
					title: 'Help Centre',
					type: 'button',
					onPress: (): void => navigation.navigate('TempSettings'),
				},
				{
					title: 'Email: support@synonym.to',
					type: 'button',
					onPress: (): void => navigation.navigate('TempSettings'),
				},
			],
		},
	];

	return (
		<View style={styles.container}>
			<TouchableOpacity
				activeOpacity={0.7}
				onPress={navigation.goBack}
				style={styles.row}>
				<Feather style={{}} name="arrow-left" size={30} />
				<Text style={styles.backText}>Settings</Text>
			</TouchableOpacity>
			<List data={SettingsListData} />
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
});

export default memo(Settings);
