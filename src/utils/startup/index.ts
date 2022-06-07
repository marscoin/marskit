import { generateMnemonic, getMnemonicPhrase, refreshWallet } from '../wallet';
import {
	createWallet,
	updateExchangeRates,
	updateWallet,
} from '../../store/actions/wallet';
import { err, ok, Result } from '../result';
import { InteractionManager } from 'react-native';
import { getStore } from '../../store/helpers';
import { backupSetup, performFullBackup } from '../../store/actions/backup';
import { showErrorNotification } from '../notifications';
import { refreshServiceList } from '../../store/actions/blocktank';
import { setupTodos } from '../todos';
import { connectToElectrum, subscribeToHeader } from '../wallet/electrum';
import { updateOnchainFeeEstimates } from '../../store/actions/fees';

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

			if (onchain) {
				updateOnchainFeeEstimates({ selectedNetwork }).then();
				const electrumResponse = await connectToElectrum({ selectedNetwork });
				if (electrumResponse.isOk()) {
					// Ensure we are subscribed to and save new header information.
					subscribeToHeader({ selectedNetwork }).then();
					refreshWallet().then();
				} else {
					showErrorNotification({
						title: 'Unable to connect to Electrum Server.',
						message:
							electrumResponse?.error?.message ??
							'Unable to connect to Electrum Server',
					});
				}
			}

			if (lightning) {
				// TODO: Start LDK
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
