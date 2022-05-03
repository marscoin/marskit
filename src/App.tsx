import '../shim';
import 'intl';
import 'intl/locale-data/jsonp/en';
import React, {
	memo,
	ReactElement,
	useMemo,
	useEffect,
	useCallback,
} from 'react';
import { Platform, UIManager } from 'react-native';
import { useSelector } from 'react-redux';
import { ThemeProvider } from 'styled-components/native';
import SlashtagsProvider from '@synonymdev/react-native-slashtags';
import { SafeAreaProvider } from './styles/components';
import { StatusBar } from './styles/components';
import RootNavigator from './navigation/root/RootNavigator';
import Store from './store/types';
import themes from './styles/themes';
import Toast from 'react-native-toast-message';
import './utils/translations';
import OnboardingNavigator from './navigation/onboarding/OnboardingNavigator';
import { checkWalletExists, startWalletServices } from './utils/startup';

if (Platform.OS === 'android') {
	if (UIManager.setLayoutAnimationEnabledExperimental) {
		UIManager.setLayoutAnimationEnabledExperimental(true);
	}
}

const App = (): ReactElement => {
	const walletExists = useSelector((state: Store) => state.wallet.walletExists);
	const theme = useSelector((state: Store) => state.settings.theme);

	useEffect(() => {
		(async (): Promise<void> => {
			const _walletExists = await checkWalletExists();
			if (_walletExists) {
				await startWalletServices({});
			}
		})();
	}, []);

	const currentTheme = useMemo(() => {
		return themes[theme];
	}, [theme]);

	const RootComponent = useCallback((): ReactElement => {
		return walletExists ? <RootNavigator /> : <OnboardingNavigator />;
	}, [walletExists]);

	return (
		<ThemeProvider theme={currentTheme}>
			<SafeAreaProvider>
				<SlashtagsProvider>
					<StatusBar />
					<RootComponent />
				</SlashtagsProvider>
			</SafeAreaProvider>
			<Toast />
		</ThemeProvider>
	);
};

export default memo(App);
