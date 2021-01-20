import '../shim';
import React, { memo, ReactElement, useEffect } from 'react';
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
import lnd, { ENetworks as LndNetworks } from 'react-native-lightning';
import Toast from 'react-native-toast-message';
import { connectToElectrum, refreshWallet } from './utils/wallet';
import './utils/translations';

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
			const walletKeys = Object.keys(wallets);
			if (!wallets[walletKeys[0]] || !wallets[walletKeys[0]]?.id) {
				await createWallet({});
			}

			const electrumResponse = await connectToElectrum({ selectedNetwork });
			if (electrumResponse.isOk()) {
				refreshWallet().then();
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
const App = (): ReactElement => {
	useEffect(() => {
		(async (): Promise<void> => {
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
