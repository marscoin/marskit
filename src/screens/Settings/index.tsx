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
import { toggleView } from '../../store/actions/user';

const rnBiometrics = new ReactNativeBiometrics();

const unitsBitcoin = {
	satoshi: 'sats',
	bitcoin: 'bitcoin',
};

const SettingsMenu = ({ navigation }): ReactElement => {
	const selectedNetwork = useSelector(
		(state: Store) => state.wallet.selectedNetwork,
	);
	const remoteBackupSynced = useSelector(
		(state: Store) => state.backup.backpackSynced,
	);

	const [biometryData, setBiometricData] = useState<
		IsSensorAvailableResult | undefined
	>(undefined);

	useEffect(() => {
		(async (): Promise<void> => {
			const data: IsSensorAvailableResult =
				await rnBiometrics.isSensorAvailable();
			setBiometricData(data);
		})();
	}, []);

	const selectedCurrency = useSelector(
		(state: Store) => state.settings.selectedCurrency,
	);

	const selectedBitcoinUnit = useSelector(
		(state: Store) => state.settings.bitcoinUnit,
	);

	const { rbf, pin, biometrics, pinOnLaunch, pinForPayments } = useSelector(
		(state: Store) => state.settings,
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
						value: pin ? 'Enabled' : 'Disabled',
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
						title: 'Pin',
						value: pin ? 'Enabled' : 'Disabled',
						type: 'button',
						onPress: (): void => {
							if (pin) {
								navigation.navigate('AuthCheck', {
									onSuccess: () => {
										navigation.pop();
										removePin().then();
									},
								});
							} else {
								toggleView({
									view: 'PINPrompt',
									data: { isOpen: true },
								});
							}
						},
						hide: false,
					},
					{
						title: 'Use biometrics to bypass the PIN',
						type: 'switch',
						enabled: biometrics,
						onPress: (): void => {
							navigation.navigate('AuthCheck', {
								onSuccess: () => {
									navigation.pop();
									toggleBiometrics();
								},
							});
						},
						hide:
							!pin || (!biometryData?.available && !biometryData?.biometryType),
					},
					{
						title: 'Require PIN on launch',
						type: 'switch',
						enabled: pinOnLaunch,
						onPress: (): void => {
							navigation.navigate('AuthCheck', {
								onSuccess: () => {
									navigation.pop();
									updateSettings({ pinOnLaunch: !pinOnLaunch });
								},
							});
						},
						hide: !pin,
					},
					{
						title: 'Require PIN for payments',
						type: 'switch',
						enabled: pinForPayments,
						onPress: (): void => {
							navigation.navigate('AuthCheck', {
								onSuccess: () => {
									navigation.pop();
									updateSettings({ pinForPayments: !pinForPayments });
								},
							});
						},
						hide: !pin,
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
		[
			biometryData?.available,
			biometryData?.biometryType,
			biometrics,
			pin,
			pinOnLaunch,
			pinForPayments,
			remoteBackupSynced,
			selectedNetwork,
			rbf,
			navigation,
			selectedBitcoinUnit,
			selectedCurrency,
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
