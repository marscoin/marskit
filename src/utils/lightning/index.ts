import { err, ok, Result } from '../result';
import lm, {
	DefaultTransactionDataShape,
	ENetworks,
	TAccount,
	THeader,
	TTransactionData,
} from '@synonymdev/react-native-ldk';
import ldk from '@synonymdev/react-native-ldk/dist/ldk';
import {
	getBlockHashFromHeight,
	getBlockHeader,
	getBlockHex,
	getTransactions,
} from '../wallet/electrum';
import {
	getMnemonicPhrase,
	getSelectedNetwork,
	getSelectedWallet,
} from '../wallet';
import Keychain from 'react-native-keychain';
import { TAvailableNetworks } from '../networks';
import { getStore } from '../../store/helpers';
import mmkvStorage from '../../store/mmkv-storage';
import * as bitcoin from 'bitcoinjs-lib';
import { header as defaultHeader } from '../../store/shapes/wallet';
import { updateLightning } from '../../store/actions/lightning';

export const defaultNodePubKey =
	'034ecfd567a64f06742ac300a2985676abc0b1dc6345904a08bb52d5418e685f79'; //Our testnet server

/**
 * Wipes LDK data from storage
 * @returns {Promise<Ok<string>>}
 */
export const wipeLdkStorage = async ({
	selectedWallet,
	selectedNetwork,
}: {
	selectedWallet?: string;
	selectedNetwork?: TAvailableNetworks;
}): Promise<Result<string>> => {
	if (!selectedWallet) {
		selectedWallet = getSelectedWallet();
	}
	if (!selectedNetwork) {
		selectedNetwork = getSelectedNetwork();
	}
	// TODO: Add wipe functionality to react-native-ldk.
	return ok(`${selectedNetwork}'s LDK directory wiped for ${selectedWallet}`);
};

const LDK_ACCOUNT_SUFFIX = 'ldkaccount';

/**
 * Used to spin-up LDK services.
 * In order, this method:
 * 1. Fetches and sets the genesis hash.
 * 2. Retrieves and sets the seed from storage.
 * 3. Starts ldk with the necessary params.
 * 5. Syncs LDK.
 */
export const setupLdk = async ({
	selectedNetwork,
}: {
	selectedNetwork: TAvailableNetworks;
}): Promise<Result<string>> => {
	try {
		if (!selectedNetwork) {
			selectedNetwork = getSelectedNetwork();
		}
		await ldk.reset();
		const genesisHash = await getBlockHashFromHeight({
			height: 0,
		});
		if (genesisHash.isErr()) {
			return err(genesisHash.error.message);
		}
		const account = await getAccount({});
		if (account.isErr()) {
			return err(account.error.message);
		}
		let network: ENetworks;
		switch (selectedNetwork) {
			case 'bitcoin':
				network = ENetworks.mainnet;
				break;
			case 'bitcoinTestnet':
				network = ENetworks.testnet;
				break;
			default:
				network = ENetworks.regtest;
				break;
		}
		const lmStart = await lm.start({
			getBestBlock,
			genesisHash: genesisHash.value,
			setItem: mmkvStorage.setItem,
			getItem: mmkvStorage.getItem,
			account: account.value,
			getTransactionData,
			network,
		});

		if (lmStart.isErr()) {
			return err(lmStart.error.message);
		}

		const nodeIdRes = await ldk.nodeId();
		if (nodeIdRes.isErr()) {
			return err(nodeIdRes.error.message);
		}

		updateLightning({ nodeId: nodeIdRes.value });

		await lm.syncLdk();
		return ok(nodeIdRes.value);
	} catch (e) {
		return err(e.toString());
	}
};

/**
 * Use Keychain to save LDK name & seed to secure storage.
 * @param {string} name
 * @param {string} seed
 */
export const setAccount = async ({
	name,
	seed,
}: TAccount): Promise<boolean> => {
	try {
		if (!name) {
			name = getSelectedWallet();
			name = `${name}${LDK_ACCOUNT_SUFFIX}`;
		}
		const account: TAccount = {
			name,
			seed,
		};
		const setRes = await Keychain.setGenericPassword(
			name,
			JSON.stringify(account),
			{
				service: name,
			},
		);
		if (!setRes || setRes?.service !== name || setRes?.storage !== 'keychain') {
			return false;
		}
		return true;
	} catch {
		return false;
	}
};

/**
 * Retrieve LDK account info from storage.
 * @param selectedWallet
 */
export const getAccount = async ({
	selectedWallet,
}: {
	selectedWallet?: string;
}): Promise<Result<TAccount>> => {
	if (!selectedWallet) {
		selectedWallet = getSelectedWallet();
	}
	const mnemonicPhrase = await getMnemonicPhrase(selectedWallet);
	if (mnemonicPhrase.isErr()) {
		return err(mnemonicPhrase.error.message);
	}
	const name = `${selectedWallet}${LDK_ACCOUNT_SUFFIX}`;
	try {
		let result = await Keychain.getGenericPassword({ service: name });
		if (result && result?.password) {
			// Return existing account.
			return ok(JSON.parse(result?.password));
		} else {
			const defaultAccount = _getDefaultAccount(name, mnemonicPhrase.value);
			// Setup default account.
			const setAccountResponse = await setAccount(defaultAccount);
			if (setAccountResponse) {
				return ok(defaultAccount);
			} else {
				return err('Unable to set LDK account.');
			}
		}
	} catch (e) {
		console.log(e);
		const defaultAccount = _getDefaultAccount(name, mnemonicPhrase.value);
		return ok(defaultAccount);
	}
};
const _getDefaultAccount = (name, mnemonic): TAccount => {
	// @ts-ignore
	const ldkSeed = bitcoin.crypto.sha256(mnemonic).toString('hex');
	return {
		name,
		seed: ldkSeed,
	};
};

/**
 * Exports complete backup string for current LDK account.
 * @param account
 * @returns {Promise<Err<unknown> | Ok<string> | Err<string>>}
 */
export const exportBackup = async (
	account?: TAccount,
): Promise<Result<string>> => {
	if (!account) {
		const res = await getAccount({});
		if (res.isErr()) {
			return err(res.error);
		}

		account = res.value;
	}
	return await lm.backupAccount({
		account,
		setItem: mmkvStorage.setItem,
		getItem: mmkvStorage.getItem,
		includeNetworkGraph: false,
	});
};

/**
 * Returns last known header information from storage.
 * @returns {Promise<THeader>}
 */
export const getBestBlock = async (
	selectedNetwork?: TAvailableNetworks,
): Promise<THeader> => {
	if (!selectedNetwork) {
		selectedNetwork = getSelectedNetwork();
	}
	try {
		const header = getStore().wallet?.header[selectedNetwork];
		return header?.hash ? header : defaultHeader;
	} catch (e) {
		console.log(e);
		return defaultHeader;
	}
};

/**
 * Returns the transaction header, height and hex (transaction) for a given txid.
 * @param {string} txId
 * @returns {Promise<TTransactionData>}
 */
export const getTransactionData = async (
	txId: string = '',
): Promise<TTransactionData> => {
	let transactionData = DefaultTransactionDataShape;
	try {
		const data = [{ tx_hash: txId }];
		const response = await getTransactions({
			txHashes: data,
		});

		if (response.isErr()) {
			return transactionData;
		}
		const { confirmations, hex: hex_encoded_tx } =
			response.value.data[0].result;
		const header = getBlockHeader({});
		const currentHeight = header.height;
		let confirmedHeight = 0;
		if (confirmations) {
			confirmedHeight = currentHeight - confirmations + 1;
		}
		const hexEncodedHeader = await getBlockHex({
			height: confirmedHeight,
		});
		if (hexEncodedHeader.isErr()) {
			return transactionData;
		}
		return {
			header: hexEncodedHeader.value,
			height: confirmedHeight,
			transaction: hex_encoded_tx,
		};
	} catch {
		return transactionData;
	}
};

/**
 * Returns the current LDK node id.
 * @returns {Promise<Result<string>>}
 */
export const getNodeId = async (): Promise<Result<string>> => {
	try {
		return await ldk.nodeId();
	} catch (e) {
		return err(e);
	}
};
