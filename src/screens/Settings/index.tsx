import React, { memo, ReactElement } from 'react';
import { StyleSheet } from 'react-native';
import { View, Feather, Text, TouchableOpacity } from '../../styles/components';
import Store from '../../store/types';
import { useSelector } from 'react-redux';
import {
	resetSettingsStore,
	updateSettings,
} from '../../store/actions/settings';
import List from '../../components/List';
import {
	resetSelectedWallet,
	resetWalletStore,
	updateWallet,
} from '../../store/actions/wallet';
import { refreshWallet } from '../../utils/wallet';
import { resetUserStore } from '../../store/actions/user';
import { resetActivityStore } from '../../store/actions/activity';
import { resetLightningStore } from '../../store/actions/lightning';
import { resetOmniBoltStore } from '../../store/actions/omnibolt';

const Settings = ({ navigation }): ReactElement => {
	const settingsTheme = useSelector((state: Store) => state.settings.theme);
	const selectedNetwork = useSelector(
		(state: Store) => state.wallet.selectedNetwork,
	);
	const selectedWallet = useSelector(
		(state: Store) => state.wallet.selectedWallet,
	);

	const updateTheme = (): void => {
		try {
			const theme = settingsTheme === 'dark' ? 'light' : 'dark';
			updateSettings({ theme });
		} catch {}
	};

	const SettingsListData = [
		{
			title: 'Settings',
			data: [
				{
					title: 'Dark Mode',
					type: 'switch',
					enabled: settingsTheme === 'dark',
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
			title: 'On-Chain Settings',
			data: [
				{
					title: 'Enable On-Chain Testnet',
					type: 'switch',
					enabled: selectedNetwork === 'bitcoinTestnet',
					onPress: async (): Promise<void> => {
						const network =
							selectedNetwork === 'bitcoin' ? 'bitcoinTestnet' : 'bitcoin';
						updateWallet({ selectedNetwork: network }).then(() => {
							refreshWallet().then();
						});
					},
				},
				{
					title: 'Manage Seed Phrase',
					type: 'button',
					onPress: async (): Promise<void> => {
						navigation.navigate('ManageSeedPhrase');
					},
				},
			],
		},
		{
			title: 'Dev Settings',
			data: [
				{
					title: 'Reset Current Wallet Store',
					type: 'button',
					onPress: async (): Promise<void> => {
						await resetSelectedWallet({ selectedWallet });
					},
				},
				{
					title: 'Reset Entire Wallet Store',
					type: 'button',
					onPress: async (): Promise<void> => {
						await resetWalletStore();
					},
				},
				{
					title: 'Reset Lightning Store',
					type: 'button',
					onPress: async (): Promise<void> => {
						await resetLightningStore();
					},
				},
				{
					title: 'Reset Omnibolt Store',
					type: 'button',
					onPress: async (): Promise<void> => {
						await resetOmniBoltStore();
					},
				},
				{
					title: 'Reset Settings Store',
					type: 'button',
					onPress: async (): Promise<void> => {
						await resetSettingsStore();
					},
				},
				{
					title: 'Reset Activity Store',
					type: 'button',
					onPress: async (): Promise<void> => {
						await resetActivityStore();
					},
				},
				{
					title: 'Reset User Store',
					type: 'button',
					onPress: async (): Promise<void> => {
						await resetUserStore();
					},
				},
				{
					title: 'Reset All Stores',
					type: 'button',
					onPress: async (): Promise<void> => {
						await Promise.all([
							resetWalletStore(),
							resetLightningStore(),
							resetSettingsStore(),
							resetActivityStore(),
							resetUserStore(),
							resetOmniBoltStore(),
						]);
					},
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
