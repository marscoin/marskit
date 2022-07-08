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
import { Platform, UIManager } from 'react-native';
import { useSelector } from 'react-redux';
import { ThemeProvider } from 'styled-components/native';
import { SafeAreaProvider } from './styles/components';
import { StatusBar } from './styles/components';
import RootNavigator from './navigation/root/RootNavigator';
import Store from './store/types';
import themes from './styles/themes';
import Toast from 'react-native-toast-message';
import './utils/translations';
import OnboardingNavigator from './navigation/onboarding/OnboardingNavigator';
import { checkWalletExists, startWalletServices } from './utils/startup';
import { SlashtagsProvider } from './components/SlashtagsProvider';
import { showErrorNotification } from './utils/notifications';
import { getSlashtagsPrimaryKey } from './utils/wallet';

if (Platform.OS === 'android') {
	if (UIManager.setLayoutAnimationEnabledExperimental) {
		UIManager.setLayoutAnimationEnabledExperimental(true);
	}
}

const App = (): ReactElement => {
	const walletExists = useSelector((state: Store) => state.wallet.walletExists);
	const theme = useSelector((state: Store) => state.settings.theme);
	const selectedWallet = useSelector(
		(store: Store) => store.wallet.selectedWallet,
	);
	const wallets = useSelector((store: Store) => store.wallet.wallets);
	const seedHash = wallets[selectedWallet].seedHash;
	const [primaryKey, setPrimaryKey] = useState<Buffer | null>(null);

	useEffect(() => {
		(async (): Promise<void> => {
			const _walletExists = await checkWalletExists();
			if (_walletExists) {
				await startWalletServices({});
			}
		})();
	}, []);

	useEffect(() => {
		(async (): Promise<void> => {
			const { error, data } = await getSlashtagsPrimaryKey(seedHash);
			if (error) {
				return;
			}
			setPrimaryKey(Buffer.from(data, 'hex'));
		})();
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
				onError={(error): void =>
					showErrorNotification({
						title: 'SlashtagsProvider Error',
						message: error.message,
					})
				}>
				<SafeAreaProvider>
					<StatusBar />
					<RootComponent />
				</SafeAreaProvider>

				<Toast />
			</SlashtagsProvider>
		</ThemeProvider>
	);
};

export default memo(App);
