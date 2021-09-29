import '../shim';
import 'intl';
import 'intl/locale-data/jsonp/en';
import React, { memo, ReactElement, useMemo, useEffect } from 'react';
import { Platform, UIManager, useColorScheme } from 'react-native';
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
import { updateSettings } from './store/actions/settings';

if (Platform.OS === 'android') {
	if (UIManager.setLayoutAnimationEnabledExperimental) {
		UIManager.setLayoutAnimationEnabledExperimental(true);
	}
}

const App = (): ReactElement => {
	const walletExists = useSelector((state: Store) => state.wallet.walletExists);
	const theme = useSelector((state: Store) => state.settings.theme);
	const colorScheme = useColorScheme();

	useEffect(() => {
		(async (): Promise<void> => {
			const _walletExists = await checkWalletExists();
			if (!_walletExists) {
				//Set theme based on device preference.
				const userPreference = colorScheme === 'light' ? 'light' : 'dark';
				updateSettings({ theme: userPreference });
			}
			if (_walletExists) {
				await startWalletServices({});
			}
		})();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const currentTheme = useMemo(() => {
		return themes[theme];
	}, [theme]);

	return (
		<ThemeProvider theme={currentTheme}>
			<SafeAreaProvider>
				<StatusBar />
				{walletExists ? <RootNavigator /> : <OnboardingNavigator />}
				<Toast ref={(ref): Toast | null => Toast.setRef(ref)} />
			</SafeAreaProvider>
		</ThemeProvider>
	);
};

export default memo(App);
