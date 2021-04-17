import { connectToElectrum, getMnemonicPhrase, refreshWallet } from '../wallet';
import { createWallet, updateWallet } from '../../store/actions/wallet';
import { err, ok, Result } from '../result';
import { InteractionManager } from 'react-native';
import { getStore } from '../../store/helpers';
import { backupSetup, performFullBackup } from '../../store/actions/backup';
import { backpackRetrieve, IBackpackAuth } from '../backup/backpack';
import { restoreFromBackup } from '../backup/backup';
import { startOmnibolt } from '../omnibolt';
import { downloadNeutrinoCache } from '../lightning/cachedHeaders';
import {
	createLightningWallet,
	startLnd,
	unlockLightningWallet,
} from '../../store/actions/lightning';
import lnd, { ENetworks as LndNetworks } from 'react-native-lightning';
import { showErrorNotification } from '../notifications';

export const checkWalletExists = async (): Promise<void> => {
	const getMnemonicPhraseResponse = await getMnemonicPhrase('wallet0');
	const { data } = getMnemonicPhraseResponse;

	await updateWallet({ walletExists: !!data });
};

export const restoreWallet = async (
	auth: IBackpackAuth,
): Promise<Result<string>> => {
	const retrieveRes = await backpackRetrieve(auth);
	if (retrieveRes.isErr()) {
		return err(retrieveRes.error);
	}

	const restoreRes = await restoreFromBackup(retrieveRes.value);
	if (restoreRes.isErr()) {
		return err(restoreRes.error);
	}

	return await startWalletServices();
};

export const createNewWallet = async (): Promise<Result<string>> => {
	//All seeds will get automatically created
	return await startWalletServices();
};

export const startWalletServices = async (): Promise<Result<string>> => {
	const lndNetwork = LndNetworks.testnet; //TODO use the same network as other wallets

	try {
		InteractionManager.runAfterInteractions(async () => {
			//Create wallet if none exists.
			let { wallets, selectedNetwork, selectedWallet } = getStore().wallet;
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

			downloadNeutrinoCache(lndNetwork)
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

					const res = await backupSetup();
					if (res.isErr()) {
						showErrorNotification({
							title: 'Failed to verify remote backup. Retrying...',
							message: res.error.message,
						});
						performFullBackup({ retries: 3, retryTimeout: 2000 }).then();
					}
				});
		});

		return ok('Wallet started');
	} catch (e) {
		return err(e);
	}
};
