import '../shim';
import 'intl';
import 'intl/locale-data/jsonp/en';
import React, {
	memo,
	ReactElement,
	useMemo,
	useEffect,
	useCallback,
	useState,
} from 'react';
import { Platform, UIManager, NativeModules } from 'react-native';
import { useSelector } from 'react-redux';
import NetInfo from '@react-native-community/netinfo';
import Toast from 'react-native-toast-message';

import { ThemeProvider } from 'styled-components/native';
import { SafeAreaProvider } from './styles/components';
import { StatusBar } from './styles/components';
import RootNavigator from './navigation/root/RootNavigator';
import Store from './store/types';
import { updateUser } from './store/actions/user';
import themes from './styles/themes';
import './utils/translations';
import OnboardingNavigator from './navigation/onboarding/OnboardingNavigator';
import { checkWalletExists, startWalletServices } from './utils/startup';
import { SlashtagsProvider } from './components/SlashtagsProvider';
import { getSlashtagsPrimaryKey } from './utils/wallet';
import { electrumConnection } from './utils/electrum';
import {
	showErrorNotification,
	showSuccessNotification,
} from './utils/notifications';
import { SlashtagsContactsProvider } from './components/SlashtagContactsProvider';
import { toastConfig } from './components/Toast';
import { onSDKError, onSDKReady } from './utils/slashtags';

if (Platform.OS === 'android') {
	if (UIManager.setLayoutAnimationEnabledExperimental) {
		UIManager.setLayoutAnimationEnabledExperimental(true);
	}
}

const App = (): ReactElement => {
	const isOnline = useSelector((state: Store) => state.user.isOnline);
	const walletExists = useSelector((state: Store) => state.wallet.walletExists);
	const theme = useSelector((state: Store) => state.settings.theme);
	const selectedWallet = useSelector(
		(store: Store) => store.wallet.selectedWallet,
	);
	const seedHash = useSelector(
		(store: Store) => store.wallet.wallets[selectedWallet]?.seedHash,
	);
	const [primaryKey, setPrimaryKey] = useState<Uint8Array>();

	useEffect(() => {
		// hide spash screen on android
		if (Platform.OS === 'android') {
			setTimeout(NativeModules.SplashScreenModule.hide, 100);
		}

		// launch wallet services
		(async (): Promise<void> => {
			const _walletExists = await checkWalletExists();
			if (_walletExists) {
				await startWalletServices({});
			}
		})();

		const unsubscribeElectrum = electrumConnection.subscribe((isConnected) => {
			if (isConnected) {
				updateUser({ isConnectedToElectrum: isConnected });
				showSuccessNotification({
					title: 'Electrum Server Reconnected',
					message: 'Successfully reconnected to Electrum Server.',
				});
			} else {
				updateUser({ isConnectedToElectrum: isConnected });
				showErrorNotification({
					title: 'Electrum Connectivity Issues',
					message: 'Lost connection to server, trying to reconnect..',
				});
			}
		});

		return () => {
			unsubscribeElectrum();
		};
	}, []);

	useEffect(() => {
		// subscribe to connection information
		const unsubscribeNetInfo = NetInfo.addEventListener(({ isConnected }) => {
			if (isConnected) {
				// prevent toast from showing on startup
				if (isOnline !== isConnected) {
					showSuccessNotification({
						title: 'You’re Back Online!',
						message: 'Successfully reconnected to the Internet.',
					});
				}
				updateUser({ isOnline: isConnected });
			} else {
				showErrorNotification({
					title: 'Internet Connectivity Issues',
					message: 'Please check your network connection.',
				});
				updateUser({ isOnline: isConnected });
			}
		});

		return () => {
			unsubscribeNetInfo();
		};
	}, [isOnline]);

	useEffect(() => {
		seedHash &&
			getSlashtagsPrimaryKey(seedHash).then(({ error, data }) => {
				!error && setPrimaryKey(Buffer.from(data, 'hex'));
			});
	}, [seedHash]);

	const currentTheme = useMemo(() => {
		return themes[theme];
	}, [theme]);

	const RootComponent = useCallback((): ReactElement => {
		return walletExists ? <RootNavigator /> : <OnboardingNavigator />;
	}, [walletExists]);

	return (
		<ThemeProvider theme={currentTheme}>
			<SlashtagsProvider
				primaryKey={primaryKey}
				// TODO(slashtags): add settings to customize this relay
				relay={'ws://localhost:45475'}
				onError={onSDKError}
				onReady={onSDKReady}>
				<SafeAreaProvider>
					<StatusBar />
					<RootComponent />
				</SafeAreaProvider>
				<Toast config={toastConfig} />
			</SlashtagsProvider>
		</ThemeProvider>
	);
};

export default memo(App);
