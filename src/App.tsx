import '../shim';
import React, { memo, useEffect } from 'react';
import {
	InteractionManager,
	Platform,
	StyleSheet,
	UIManager,
} from 'react-native';
import { useSelector } from 'react-redux';
import { ThemeProvider } from 'styled-components/native';
import { StatusBar, SafeAreaView } from './styles/components';
import RootNavigator from './navigation/root/RootNavigator';
import Store from './store/types';
import useLightning from './utils/hooks/lightning';
import themes from './styles/themes';
import { getStore } from './store/helpers';
import { createWallet } from './store/actions/wallet';
import { start as startElectrum } from 'rn-electrum-client/helpers';

if (Platform.OS === 'android') {
	if (UIManager.setLayoutAnimationEnabledExperimental) {
		UIManager.setLayoutAnimationEnabledExperimental(true);
	}
}

const startApp = async (): Promise<void> => {
	try {
		InteractionManager.runAfterInteractions(async () => {
			//Create wallet if none exists.
			let { wallets, selectedNetwork } = getStore().wallet;
			if (Object.keys(wallets).length < 1) {
				await createWallet({});
			}

			//Connect To A Random Electrum Server
			const startResponse = await startElectrum({ network: selectedNetwork });
			if (startResponse.error) {
				return;
			}
		});
	} catch {}
};
const App = () => {
	useLightning();

	useEffect(() => {
		startApp();
	}, []);

	const settings = useSelector((state: Store) => state.settings);
	return (
		<ThemeProvider theme={themes[settings.theme]}>
			<StatusBar />
			<SafeAreaView style={styles.container}>
				<RootNavigator />
			</SafeAreaView>
		</ThemeProvider>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
});

export default memo(App);
