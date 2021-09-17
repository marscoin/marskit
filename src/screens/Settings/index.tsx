import React, {
	memo,
	ReactElement,
	useCallback,
	useEffect,
	useMemo,
	useState,
} from 'react';
import { Linking, Platform, StyleSheet } from 'react-native';
import { View, Feather, Text, TouchableOpacity } from '../../styles/components';
import Store from '../../store/types';
import { useSelector } from 'react-redux';
import {
	resetSettingsStore,
	updateSettings,
	wipeWallet,
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
import { removePin, toggleBiometrics } from '../../utils/settings';
import ReactNativeBiometrics from 'react-native-biometrics';
import { IsSensorAvailableResult } from '../../components/Biometrics';
import { resetBlocktankStore } from '../../store/actions/blocktank';

const Settings = ({ navigation }): ReactElement => {
	const settingsTheme = useSelector((state: Store) => state.settings.theme);
	const selectedNetwork = useSelector(
		(state: Store) => state.wallet.selectedNetwork,
	);
	const selectedWallet = useSelector(
		(state: Store) => state.wallet.selectedWallet,
	);
	const remoteBackupSynced = useSelector(
		(state: Store) => state.backup.backpackSynced,
	);

	const [biometryData, setBiometricData] =
		useState<IsSensorAvailableResult | undefined>(undefined);

	useEffect(() => {
		(async (): Promise<void> => {
			const data: IsSensorAvailableResult =
				await ReactNativeBiometrics.isSensorAvailable();
			setBiometricData(data);
		})();
	}, []);

	const updateTheme = useCallback((): void => {
		try {
			const theme = settingsTheme === 'dark' ? 'light' : 'dark';
			updateSettings({ theme });
		} catch {}
	}, [settingsTheme]);

	const hasPin = useSelector((state: Store) => state.settings.pin);
	const hasBiometrics = useSelector(
		(state: Store) => state.settings.biometrics,
	);

	const SettingsListData = useMemo(
		() => [
			{
				title: 'Settings',
				data: [
					{
						title: 'Dark Mode',
						type: 'switch',
						enabled: settingsTheme === 'dark',
						onPress: updateTheme,
						hide: false,
					},
					{
						title: 'Pin',
						type: 'switch',
						enabled: hasPin,
						onPress: (): void => {
							if (hasPin) {
								removePin().then();
							} else {
								navigation.navigate('Pin', {
									pinSetup: !hasPin,
									navigateBackOnSuccess: true,
								});
							}
						},
						hide: false,
					},
					{
						title: 'Biometrics',
						type: 'switch',
						enabled: hasBiometrics,
						onPress: (): void => {
							toggleBiometrics();
						},
						hide: !biometryData?.available && !biometryData?.biometryType,
					},
					{
						title: 'Fiat Currency Selection',
						type: 'button',
						onPress: (): void => navigation.navigate('ExchangeRateSettings'),
						hide: false,
					},
					{
						title: 'Coin-Select Preference',
						type: 'button',
						onPress: (): void => navigation.navigate('CoinSelectPreference'),
						hide: false,
					},
					{
						title: 'Address-Type Preference',
						type: 'button',
						onPress: (): void => navigation.navigate('AddressTypePreference'),
						hide: false,
					},
					{
						title: 'Security',
						type: 'button',
						onPress: (): void => navigation.navigate('TempSettings'),
						hide: false,
					},
					{
						title: 'Two-Factor Authentication',
						type: 'button',
						onPress: (): void => navigation.navigate('TempSettings'),
						hide: false,
					},
					{
						title: 'App Permissions',
						type: 'button',
						onPress: (): void => {
							if (Platform.OS === 'ios') {
								Linking.openURL('App-Prefs:Privacy');
							} else {
								Linking.openSettings();
							}
						},
						hide: false,
					},
					{
						title: 'Electrum Config',
						type: 'button',
						onPress: (): void => navigation.navigate('ElectrumConfig'),
						hide: false,
					},
				],
			},
			{
				title: 'Backup',
				data: [
					{
						title: `${remoteBackupSynced ? 'Synced ✅' : 'Requires backup ❌'}`,
						type: 'icon',
						onPress: (): void => navigation.navigate('BackupSettings'),
						enabled: true,
						hide: false,
					},

					{
						title: 'Export Backups',
						type: 'icon',
						onPress: (): void => navigation.navigate('ExportBackups'),
						enabled: true,
						hide: false,
					},
				],
			},
			{
				title: 'Lightning Network',
				data: [
					{
						title: 'Node info',
						type: 'button',
						onPress: (): void => navigation.navigate('LightningNodeInfo'),
						hide: false,
					},
					{
						title: 'Channels',
						type: 'button',
						onPress: (): void => navigation.navigate('LightningChannels'),
						hide: false,
					},
					{
						title: 'LND Logs',
						type: 'button',
						onPress: (): void => navigation.navigate('LndLogs'),
						hide: false,
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
						hide: false,
					},
					{
						title: 'Manage Seed Phrase',
						type: 'button',
						onPress: async (): Promise<void> => {
							navigation.navigate('ManageSeedPhrase');
						},
						hide: false,
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
						hide: false,
					},
					{
						title: 'Reset Entire Wallet Store',
						type: 'button',
						onPress: async (): Promise<void> => {
							await resetWalletStore();
						},
						hide: false,
					},
					{
						title: 'Reset Lightning Store',
						type: 'button',
						onPress: async (): Promise<void> => {
							await resetLightningStore();
						},
						hide: false,
					},
					{
						title: 'Reset Omnibolt Store',
						type: 'button',
						onPress: async (): Promise<void> => {
							await resetOmniBoltStore();
						},
						hide: false,
					},
					{
						title: 'Reset Settings Store',
						type: 'button',
						onPress: async (): Promise<void> => {
							await resetSettingsStore();
						},
						hide: false,
					},
					{
						title: 'Reset Activity Store',
						type: 'button',
						onPress: async (): Promise<void> => {
							await resetActivityStore();
						},
						hide: false,
					},
					{
						title: 'Reset User Store',
						type: 'button',
						onPress: async (): Promise<void> => {
							await resetUserStore();
						},
						hide: false,
					},
					{
						title: 'Reset Blocktank Store',
						type: 'button',
						onPress: async (): Promise<void> => {
							await resetBlocktankStore();
						},
						hide: false,
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
								resetBlocktankStore(),
							]);
						},
						hide: false,
					},
					{
						title: 'Wipe Wallet Data',
						type: 'button',
						onPress: wipeWallet,
						hide: false,
					},
				],
			},
			{
				title: 'About',
				data: [
					{
						title: 'Twitter: @synonym_to',
						type: 'button',
						onPress: (): Promise<void> =>
							Linking.openURL('https://twitter.com/synonym_to').then(),
						hide: false,
					},
					{
						title: 'Telegram',
						type: 'button',
						onPress: (): Promise<void> =>
							Linking.openURL('https://t.me/backpackwallet').then(),
						hide: false,
					},
					{
						title: 'Email: info@synonym.to',
						type: 'button',
						onPress: (): Promise<void> =>
							Linking.openURL('mailto:info@synonym.to?subject=General Inquiry'),
						hide: false,
					},
					{
						title: 'Website: synonym.to',
						type: 'button',
						onPress: (): Promise<void> =>
							Linking.openURL('https://synonym.to').then(),
						hide: false,
					},
					{
						title: 'Leave A Review',
						type: 'button',
						onPress: (): void => navigation.navigate('TempSettings'),
						hide: false,
					},
					{
						title: 'Report A Bug',
						type: 'button',
						onPress: (): void => navigation.navigate('TempSettings'),
						hide: false,
					},
					{
						title: 'Contribute to this open-source project',
						type: 'button',
						onPress: (): Promise<void> =>
							Linking.openURL('https://github.com/synonymdev').then(),
						hide: false,
					},
					{
						title: 'Legal',
						type: 'button',
						onPress: (): void => navigation.navigate('TempSettings'),
						hide: false,
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
						hide: false,
					},
					{
						title: 'Email: support@synonym.to',
						type: 'button',
						onPress: (): Promise<void> =>
							Linking.openURL(
								'mailto:support@synonym.to?subject=Support Request',
							),
						hide: false,
					},
				],
			},
		],
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[
			biometryData?.available,
			biometryData?.biometryType,
			hasBiometrics,
			hasPin,
			remoteBackupSynced,
			selectedNetwork,
			selectedWallet,
			settingsTheme,
		],
	);

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
