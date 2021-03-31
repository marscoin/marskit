import '../shim';
import React, { memo, ReactElement, useEffect, useState } from 'react';
import {
	ActivityIndicator,
	InteractionManager,
	Platform,
	StyleSheet,
	UIManager,
	View,
} from 'react-native';
import { useSelector } from 'react-redux';
import { ThemeProvider } from 'styled-components/native';
import { StatusBar, SafeAreaView } from './styles/components';
import RootNavigator from './navigation/root/RootNavigator';
import Store from './store/types';
import themes from './styles/themes';
import { getStore } from './store/helpers';
import { createWallet, updateWallet } from './store/actions/wallet';
import {
	startLnd,
	createLightningWallet,
	unlockLightningWallet,
} from './store/actions/lightning';
import lnd, { ENetworks as LndNetworks } from 'react-native-lightning';
import Toast from 'react-native-toast-message';
import { connectToElectrum, refreshWallet } from './utils/wallet';
import './utils/translations';
import { startOmnibolt } from './utils/omnibolt';
import { downloadNeutrinoCache } from './utils/lightning/cachedHeaders';
import { backupSetup } from './store/actions/backup';
import OnboardingNavigator from './navigation/onboarding/OnboardingNavigator';
import { checkWalletExists } from './utils/startup';

if (Platform.OS === 'android') {
	if (UIManager.setLayoutAnimationEnabledExperimental) {
		UIManager.setLayoutAnimationEnabledExperimental(true);
	}
}

const App = (): ReactElement => {
	const { walletExists } = useSelector((state: Store) => state.wallet);

	//TODO use loading to start up the wallet services

	//TODO check we have a wallet already
	useEffect(() => {
		(async (): Promise<void> => {
			await checkWalletExists();
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
	loaderContent: {
		flex: 1,
		justifyContent: 'center',
	},
});

export default memo(App);
