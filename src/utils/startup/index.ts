import { connectToElectrum, getMnemonicPhrase, refreshWallet } from '../wallet';
import { createWallet, updateWallet } from '../../store/actions/wallet';
import { err, ok, Result } from '../result';
import { InteractionManager } from 'react-native';
import { getStore } from '../../store/helpers';
import { backupSetup, performFullBackup } from '../../store/actions/backup';
import { backpackRetrieve, IBackpackAuth } from '../backup/backpack';
import { restoreFromBackup } from '../backup/backup';
import { startOmnibolt } from '../omnibolt';
import {
	createLightningWallet,
	startLnd,
	unlockLightningWallet,
	updateCachedNeutrinoDownloadState,
} from '../../store/actions/lightning';
import lnd, {
	ENetworks as LndNetworks,
} from '@synonymdev/react-native-lightning';
import lndCache from '@synonymdev/react-native-lightning/dist/utils/neutrino-cache';
import { showErrorNotification } from '../notifications';

export const checkWalletExists = async (): Promise<void> => {
	const response = await getMnemonicPhrase('wallet0');
	let walletExists = false;
	if (response.isOk() && !!response.value) {
		walletExists = true;
	}
	await updateWallet({ walletExists });
};

/**
 * Creates a new wallet from scratch
 * @returns {Promise<Ok<string> | Err<string>>}
 */
export const createNewWallet = async (): Promise<Result<string>> => {
	//All seeds will get automatically created
	return await startWalletServices();
};

/**
 * Starts all wallet services
 * @returns {Promise<Err<unknown> | Ok<string>>}
 */
export const startWalletServices = async (): Promise<Result<string>> => {
	try {
		InteractionManager.runAfterInteractions(async () => {
			//Create wallet if none exists.
			let { wallets, selectedNetwork, selectedWallet } = getStore().wallet;
			let lndNetwork = LndNetworks.testnet;
			if (selectedNetwork === 'bitcoin') {
				lndNetwork = LndNetworks.mainnet;
			}
			const walletKeys = Object.keys(wallets);
			if (!wallets[walletKeys[0]] || !wallets[walletKeys[0]]?.id) {
				await createWallet({});
			}

			const electrumResponse = await connectToElectrum({ selectedNetwork });
			if (electrumResponse.isOk()) {
				refreshWallet().then();
			}

			//Create and start omnibolt.
			startOmnibolt({ selectedWallet }).then();

			lndCache.addStateListener(updateCachedNeutrinoDownloadState);
			lndCache
				.downloadCache(lndNetwork)
				//Start LND no matter the outcome of the download
				.finally(async () => {
					await startLnd(lndNetwork);

					// Create or unlock LND wallet
					const existsRes = await lnd.walletExists(lndNetwork);
					if (existsRes.isOk() && existsRes.value) {
						await unlockLightningWallet({
							network: lndNetwork,
						});
					} else {
						await createLightningWallet({
							network: lndNetwork,
						});
					}

					setTimeout(async () => {
						const res = await backupSetup();
						if (res.isErr()) {
							showErrorNotification({
								title: 'Failed to verify remote backup. Retrying...',
								message: res.error.message,
							});
							performFullBackup({ retries: 3, retryTimeout: 2000 }).then();
						}
					}, 3000);
				});
		});

		return ok('Wallet started');
	} catch (e) {
		return err(e);
	}
};
