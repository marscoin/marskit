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
import {
	startLnd,
	createLightningWallet,
	unlockLightningWallet,
} from './store/actions/lightning';
import { start as startElectrum } from 'rn-electrum-client/helpers';
import { ENetworks as LndNetworks } from 'react-native-lightning/dist/types';
import lnd from 'react-native-lightning';
import Toast from 'react-native-toast-message';

if (Platform.OS === 'android') {
	if (UIManager.setLayoutAnimationEnabledExperimental) {
		UIManager.setLayoutAnimationEnabledExperimental(true);
	}
}

const lndNetwork = LndNetworks.testnet; //TODO use the same network as other wallets
const tempPassword = 'shhhhhhhh123'; //TODO use keychain stored password

const startApp = async (): Promise<void> => {
	try {
		InteractionManager.runAfterInteractions(async () => {
			//Start LND service first as neutrino sync times can take time
			await startLnd(lndNetwork);

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

			//Create or unlock LND wallet
			const existsRes = await lnd.walletExists(lndNetwork);
			if (existsRes.isOk() && existsRes.value) {
				await unlockLightningWallet({
					password: tempPassword,
					network: lndNetwork,
				});
			} else {
				//TODO try use same seed as on chain wallet
				await createLightningWallet({
					password: tempPassword,
					mnemonic: '',
					network: lndNetwork,
				});
			}
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
			<Toast ref={(ref) => Toast.setRef(ref)} />
		</ThemeProvider>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
});

export default memo(App);
