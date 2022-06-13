import React, { memo, ReactElement, useEffect, useMemo, useState } from 'react';
import { Linking, Platform } from 'react-native';
import Store from '../../store/types';
import { useSelector } from 'react-redux';
import { updateSettings } from '../../store/actions/settings';
import { IListData } from '../../components/List';
import { updateWallet } from '../../store/actions/wallet';
import { refreshWallet } from '../../utils/wallet';
import { removePin, toggleBiometrics } from '../../utils/settings';
import ReactNativeBiometrics from 'react-native-biometrics';
import { IsSensorAvailableResult } from '../../components/Biometrics';
import SettingsView from './SettingsView';

const SettingsMenu = ({ navigation }): ReactElement => {
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
	const rbf = useSelector((state: Store) => state.settings?.rbf ?? true);

	const [biometryData, setBiometricData] = useState<
		IsSensorAvailableResult | undefined
	>(undefined);

	useEffect(() => {
		(async (): Promise<void> => {
			const data: IsSensorAvailableResult =
				await ReactNativeBiometrics.isSensorAvailable();
			setBiometricData(data);
		})();
	}, []);

	const hasPin = useSelector((state: Store) => state.settings.pin);

	const selectedCurrency = useSelector(
		(state: Store) => state.settings.selectedCurrency,
	);

	const selectedBitcoinUnit = useSelector(
		(state: Store) => state.settings.bitcoinUnit,
	);

	const unitsBitcoin = {
		satoshi: 'sats',
		bitcoin: 'bitcoin',
	};

	const hasBiometrics = useSelector(
		(state: Store) => state.settings.biometrics,
	);

	const SettingsListData: IListData[] = useMemo(
		() => [
			{
				title: 'General',
				data: [
					{
						title: 'Local currency',
						value: selectedCurrency,
						type: 'button',
						onPress: (): void => navigation.navigate('CurrenciesSettings'),
						hide: false,
					},
					{
						title: 'Bitcoin unit',
						value: unitsBitcoin[selectedBitcoinUnit],
						type: 'button',
						onPress: (): void => navigation.navigate('BitcoinSettings'),
						hide: false,
					},
					{
						title: 'Default transaction speed',
						value: 'Normal',
						type: 'button',
						onPress: (): void => {},
						hide: false,
					},
					{
						title: 'Display suggestions',
						value: hasPin ? 'Enabled' : 'Disabled',
						type: 'switch',
						onPress: (): void => {},
						hide: false,
					},
					{
						title: 'Reset suggestions',
						type: 'button',
						onPress: (): void => {},
						hide: false,
					},
				],
			},
			{
				title: 'Security and Privacy',
				data: [
					{
						title: 'Swipe balance to hide',
						value: hasPin ? 'Enabled' : 'Disabled',
						type: 'switch',
						onPress: (): void => {},
						hide: false,
					},
					{
						title: 'Change PIN code',
						value: hasPin ? 'Enabled' : 'Disabled',
						type: 'button',
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
						title: 'Require PIN on launch',
						value: hasPin ? 'Enabled' : 'Disabled',
						type: 'switch',
						onPress: (): void => {},
						hide: false,
					},
					{
						title: 'Require PIN for payments',
						value: hasPin ? 'Enabled' : 'Disabled',
						type: 'switch',
						onPress: (): void => {},
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
						title: 'App permissions',
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
				],
			},
			{
				title: 'Networks',
				data: [
					{
						title: 'Lightning Network',
						type: 'button',
						onPress: (): void => navigation.navigate('LightningNodeInfo'),
						hide: false,
					},
					{
						title: 'Electrum Server',
						type: 'button',
						onPress: (): void => navigation.navigate('ElectrumConfig'),
						hide: false,
					},
					{
						title: 'Tor',
						type: 'switch',
						enabled: rbf,
						onPress: async (): Promise<void> => {},
						hide: false,
					},
				],
			},
			{
				title: 'Backups',
				data: [
					{
						title: 'Backup your money',
						type: 'button',
						onPress: async (): Promise<void> => {
							navigation.navigate('Seeds');
						},
						hide: false,
					},
					{
						title: 'Backup your data',
						type: 'button',
						onPress: (): void => navigation.navigate('ExportBackups'),
						enabled: true,
						hide: false,
					},
					{
						title: 'Reset and restore wallet',
						type: 'button',
						onPress: (): void => {},
						enabled: true,
						hide: false,
					},
					{
						title: 'Connect',
						value: `${remoteBackupSynced ? 'Synced' : 'Not synced'}`,
						type: 'button',
						onPress: (): void => navigation.navigate('BackupSettings'),
						enabled: true,
						hide: false,
					},
				],
			},
			{
				title: 'Advanced',
				data: [
					{
						title: 'Coin selection',
						type: 'button',
						onPress: (): void => navigation.navigate('CoinSelectPreference'),
						hide: false,
					},
					{
						title: 'Payment preference',
						type: 'button',
						onPress: (): void => {},
						hide: false,
					},
					{
						title: 'Address types preference',
						type: 'button',
						onPress: (): void => navigation.navigate('AddressTypePreference'),
						hide: false,
					},
					{
						title: 'Enable RBF',
						type: 'switch',
						enabled: rbf,
						onPress: async (): Promise<void> => {
							updateSettings({ rbf: !rbf });
						},
						hide: false,
					},
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
						title: 'Dev settings',
						type: 'button',
						onPress: (): void => navigation.navigate('DevSettings'),
						hide: false,
					},
				],
			},
			{
				title: 'About Bitkit',
				data: [
					{
						title: 'Twitter',
						type: 'button',
						onPress: (): Promise<void> =>
							Linking.openURL('https://twitter.com/synonym_to').then(),
						hide: false,
					},
					{
						title: 'Telegram',
						type: 'button',
						onPress: (): Promise<void> =>
							Linking.openURL('https://t.me/synonym_to').then(),
						hide: false,
					},
					{
						title: 'Email',
						type: 'button',
						onPress: (): Promise<void> =>
							Linking.openURL('mailto:info@synonym.to?subject=General Inquiry'),
						hide: false,
					},
					{
						title: 'Website',
						type: 'button',
						onPress: (): Promise<void> =>
							Linking.openURL('https://synonym.to').then(),
						hide: false,
					},
					{
						title: 'Leave a review',
						type: 'button',
						onPress: (): void => navigation.navigate('TempSettings'),
						hide: false,
					},
					{
						title: 'Report a bug',
						type: 'button',
						onPress: (): void => navigation.navigate('TempSettings'),
						hide: false,
					},
					{
						title: 'Contribute to this project',
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
					{
						title: 'Version',
						value: '1.0.1',
						type: 'textButton',
						onPress: (): void => {},
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
			rbf,
		],
	);

	return (
		<SettingsView
			title={'Settings'}
			listData={SettingsListData}
			showBackNavigation={true}
		/>
	);
};

export default memo(SettingsMenu);
