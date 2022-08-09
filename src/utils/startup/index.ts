import { generateMnemonic, getMnemonicPhrase, refreshWallet } from '../wallet';
import {
	createWallet,
	updateExchangeRates,
	updateWallet,
} from '../../store/actions/wallet';
import { err, ok, Result } from '@synonymdev/result';
import { InteractionManager } from 'react-native';
import { getStore } from '../../store/helpers';
//import { backupSetup, performFullBackup } from '../../store/actions/backup';
import { showErrorNotification } from '../notifications';
import { refreshServiceList } from '../../store/actions/blocktank';
import { setupTodos } from '../todos';
import { connectToElectrum, subscribeToHeader } from '../wallet/electrum';
import { updateOnchainFeeEstimates } from '../../store/actions/fees';
import { setupLdk } from '../lightning';
import lm from '@synonymdev/react-native-ldk';
import { ICustomElectrumPeer } from '../../store/types/settings';

/**
 * Checks if the specified wallet's phrase is saved to storage.
 */
export const checkWalletExists = async (
	wallet = 'wallet0',
): Promise<boolean> => {
	try {
		const response = await getMnemonicPhrase(wallet);
		let walletExists = false;
		if (response.isOk() && !!response.value) {
			walletExists = true;
		}
		const _walletExists = getStore()?.wallet?.walletExists;
		if (walletExists !== _walletExists) {
			await updateWallet({ walletExists });
		}
		return walletExists;
	} catch (e) {
		return false;
	}
};

/**
 * Creates a new wallet from scratch
 * @returns {Promise<Result<string>>}
 */
export const createNewWallet = async (): Promise<Result<string>> => {
	//All seeds will get automatically created
	return await startWalletServices({});
};

export const restoreWallet = async ({
	mnemonic,
}: {
	mnemonic: string;
}): Promise<Result<string>> => {
	const res = await createWallet({ mnemonic });
	if (res.isErr()) {
		return res;
	}
	return await startWalletServices({});
};

/*
// Callback passed to startLnd to be called after RPC is ready
const backupServiceStart = async (): Promise<void> => {
	const res = await backupSetup();
	if (res.isErr()) {
		showErrorNotification({
			title: 'Failed to verify remote backup. Retrying...',
			message: res.error.message,
		});
	}
	performFullBackup({ retries: 3, retryTimeout: 2000 }).then();
};*/

/**
 * Starts all wallet services
 * @returns {Promise<Result<string>>}
 */
const ENABLE_SERVICES = true;
export const startWalletServices = async ({
	onchain = ENABLE_SERVICES,
	lightning = ENABLE_SERVICES,
}: {
	onchain?: boolean;
	lightning?: boolean;
}): Promise<Result<string>> => {
	try {
		InteractionManager.runAfterInteractions(async () => {
			//Create wallet if none exists.
			let { wallets, selectedNetwork } = getStore().wallet;

			const walletExists = await checkWalletExists();
			const walletKeys = Object.keys(wallets);
			if (
				!walletExists ||
				!wallets[walletKeys[0]] ||
				!wallets[walletKeys[0]]?.id
			) {
				const mnemonic = await generateMnemonic();
				if (!mnemonic) {
					return err('Unable to generate mnemonic.');
				}
				await createWallet({ mnemonic });
			}

			// We need to start Electrum if either onchain or lightning is true.
			if (onchain || lightning) {
				// Connect to Electrum
				let customPeers: ICustomElectrumPeer[] | undefined;
				/*customPeers = [
					{
						host: '192.168.50.35',
						ssl: 50001,
						tcp: 50001,
						protocol: 'tcp',
					},
				];*/
				const electrumResponse = await connectToElectrum({
					selectedNetwork,
					customPeers,
				});
				if (electrumResponse.isOk()) {
					let onReceive = (): void => {};
					// TODO: Remove regtest condition once LDK is enabled for mainnet and testnet.
					if (lightning && selectedNetwork === 'bitcoinRegtest') {
						// Start LDK
						const setupResponse = await setupLdk({ selectedNetwork });
						if (setupResponse.isOk()) {
							// Ensure LDK syncs when a new block is detected.
							onReceive = lm.syncLdk;
						} else {
							showErrorNotification({
								title: 'Unable to start LDK.',
								message: setupResponse.error.message,
							});
						}
					}
					// Ensure we are subscribed to and save new header information.
					subscribeToHeader({ selectedNetwork, onReceive }).then();
				} else {
					showErrorNotification({
						title: 'Unable to connect to Electrum Server.',
						message:
							electrumResponse?.error?.message ??
							'Unable to connect to Electrum Server',
					});
				}
			}

			if (onchain) {
				updateOnchainFeeEstimates({ selectedNetwork }).then();
				refreshWallet({}).then();
			}

			setupTodos();

			await updateExchangeRates();
			await refreshServiceList();
			//backupServiceStart().then();
		});

		return ok('Wallet started');
	} catch (e) {
		return err(e);
	}
};
