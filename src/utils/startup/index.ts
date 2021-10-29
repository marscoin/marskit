import {
	getMnemonicPhrase,
	getMnemonicPhraseFromEntropy,
	refreshWallet,
} from '../wallet';
import {
	createWallet,
	updateExchangeRates,
	updateWallet,
} from '../../store/actions/wallet';
import { err, ok, Result } from '../result';
import { InteractionManager } from 'react-native';
import { getStore } from '../../store/helpers';
import { backupSetup, performFullBackup } from '../../store/actions/backup';
import { startOmnibolt } from '../omnibolt';
import {
	startLnd,
	updateCachedNeutrinoDownloadState,
} from '../../store/actions/lightning';
import lndCache from '@synonymdev/react-native-lightning/dist/utils/neutrino-cache';
import { ENetworks as LndNetworks } from '@synonymdev/react-native-lightning/dist/utils/types';
import { showErrorNotification } from '../notifications';
import { refreshServiceList } from '../../store/actions/blocktank';
import { setupTodos } from '../todos';
import { connectToElectrum } from '../wallet/electrum';
import { setupLightningSeed } from '../lightning';

/**
 * Checks if the specified wallet's phrase is saved to storage.
 */
export const checkWalletExists = async (
	wallet = 'wallet0',
): Promise<boolean> => {
	const response = await getMnemonicPhrase(wallet);
	let walletExists = false;
	if (response.isOk() && !!response.value) {
		walletExists = true;
	}
	const _walletExists = getStore().wallet.walletExists;
	if (walletExists !== _walletExists) {
		await updateWallet({ walletExists });
	}
	return walletExists;
};

/**
 * Creates a new wallet from scratch
 * @returns {Promise<Ok<string> | Err<string>>}
 */
export const createNewWallet = async (): Promise<Result<string>> => {
	//All seeds will get automatically created
	return await startWalletServices({});
};

/**
 * Callback passed to startLnd to be called after RPC is ready
 * @returns {Promise<void>}
 */
const backupServiceStart = async (): Promise<void> => {
	const res = await backupSetup();
	if (res.isErr()) {
		showErrorNotification({
			title: 'Failed to verify remote backup. Retrying...',
			message: res.error.message,
		});
	}
	performFullBackup({ retries: 3, retryTimeout: 2000 }).then();
};

/**
 * Starts all wallet services
 * @returns {Promise<Err<unknown> | Ok<string>>}
 */
const ENABLE_SERVICES = true;
export const startWalletServices = async ({
	onchain = ENABLE_SERVICES,
	lightning = ENABLE_SERVICES,
	omnibolt = ENABLE_SERVICES,
}: {
	onchain?: boolean;
	lightning?: boolean;
	omnibolt?: boolean;
}): Promise<Result<string>> => {
	try {
		InteractionManager.runAfterInteractions(async () => {
			//Create wallet if none exists.
			let { wallets, selectedNetwork, selectedWallet } = getStore().wallet;

			const walletExists = await checkWalletExists();
			const walletKeys = Object.keys(wallets);
			if (
				!walletExists ||
				!wallets[walletKeys[0]] ||
				!wallets[walletKeys[0]]?.id
			) {
				const lndSeed = await setupLightningSeed();
				if (lndSeed.isErr()) {
					return err('Unable to setup lightning seed.');
				}
				const mnemonic = getMnemonicPhraseFromEntropy(lndSeed.value.join(' '));
				await createWallet({ mnemonic });
			}

			if (onchain) {
				const electrumResponse = await connectToElectrum({ selectedNetwork });
				if (electrumResponse.isOk()) {
					refreshWallet().then();
				} else {
					showErrorNotification({
						title: 'Unable to connect to Electrum Server.',
						message: electrumResponse.error.message,
					});
				}
			}

			if (omnibolt) {
				//Create and start omnibolt.
				startOmnibolt({ selectedWallet }).then();
			}

			if (lightning) {
				let lndNetwork = LndNetworks.testnet;
				if (selectedNetwork === 'bitcoin') {
					lndNetwork = LndNetworks.mainnet;
				}
				lndCache.addStateListener(updateCachedNeutrinoDownloadState);
				lndCache
					.downloadCache(lndNetwork)
					.catch()
					//Start LND no matter the outcome of the download
					.finally(async () => {
						await startLnd(lndNetwork, backupServiceStart);
					});
			}

			setupTodos();

			await updateExchangeRates();
			await refreshServiceList();
		});

		return ok('Wallet started');
	} catch (e) {
		return err(e);
	}
};
