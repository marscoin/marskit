import '../shim';
import React, { memo, ReactElement, useEffect } from 'react';
import { Platform, StyleSheet, UIManager } from 'react-native';
import { useSelector } from 'react-redux';
import { ThemeProvider } from 'styled-components/native';
import { StatusBar, SafeAreaView } from './styles/components';
import RootNavigator from './navigation/root/RootNavigator';
import Store from './store/types';
import themes from './styles/themes';
import Toast from 'react-native-toast-message';
import './utils/translations';
import OnboardingNavigator from './navigation/onboarding/OnboardingNavigator';
import { checkWalletExists, startWalletServices } from './utils/startup';
import { getStore } from './store/helpers';

if (Platform.OS === 'android') {
	if (UIManager.setLayoutAnimationEnabledExperimental) {
		UIManager.setLayoutAnimationEnabledExperimental(true);
	}
}

const App = (): ReactElement => {
	const { walletExists } = useSelector((state: Store) => state.wallet);

	useEffect(() => {
		(async (): Promise<void> => {
			await checkWalletExists();

			if (getStore().wallet.walletExists) {
				await startWalletServices();
			}
		})();
	}, []);

	const settings = useSelector((state: Store) => state.settings);
	return (
		<ThemeProvider theme={themes[settings.theme]}>
			<StatusBar />
			<SafeAreaView style={styles.container}>
				{walletExists ? <RootNavigator /> : <OnboardingNavigator />}
			</SafeAreaView>
			<Toast ref={(ref): Toast | null => Toast.setRef(ref)} />
		</ThemeProvider>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
});

export default memo(App);
