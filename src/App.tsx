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
import themes from './styles/themes';
import { getStore } from './store/helpers';
import { createWallet } from './store/actions/wallet';
import { start as startElectrum } from 'rn-electrum-client/helpers';
import {
	startLnd,
	updateLightningState,
	createOrUnlockLndWallet,
} from './utils/lightning';

if (Platform.OS === 'android') {
	if (UIManager.setLayoutAnimationEnabledExperimental) {
		UIManager.setLayoutAnimationEnabledExperimental(true);
	}
}

const startApp = async (): Promise<void> => {
	//Need to set the LND state from the start or it assumes previous incorrect state until LND is started
	await updateLightningState();

	try {
		InteractionManager.runAfterInteractions(async () => {
			//Start LND service first as neutrino sync times can take time
			await startLnd();

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

			//TODO try use same seed as on chain wallet
			await createOrUnlockLndWallet();
		});
	} catch {}
};
const App = () => {
	useEffect(() => {
		(async () => {
			await startApp();
		})();
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
