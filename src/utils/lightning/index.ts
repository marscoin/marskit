import RNFS from 'react-native-fs';
import { err, ok, Result } from '../result';
import {
	deriveMnemonicPhrases,
	getMnemonicPhrase,
	getSelectedNetwork,
	getSelectedWallet,
} from '../wallet';
import { TAvailableNetworks } from '../networks';

export const defaultNodePubKey =
	'034ecfd567a64f06742ac300a2985676abc0b1dc6345904a08bb52d5418e685f79'; //Our testnet server
//const defaultNodeHost = '35.240.72.95:9735'; //Our testnet server

// const defaultNodePubKey =
// 	'024684a0ed0cf7075b9e56d7825e44eb30ac7de7b93dea1b72dab05d23b90c8dbd'; //Local regtest node
// const defaultNodeHost = '127.0.0.1:9737'; //Local regtest node

/**
 * Wipes the testnet directory for LND
 * @returns {Promise<Ok<string>>}
 */
export const wipeLndDir = async ({
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
	// TODO: Stop LDK service first...
	const existingLndDir = getLightningDirectory({
		selectedWallet,
		selectedNetwork,
	});
	try {
		await RNFS.unlink(existingLndDir);
	} catch (e) {
		return err(e);
	}
	return ok('LND directory wiped');
};

/**
 * Attempt to deterministically derive lightning seed from on-chain seed.
 * @return {Promise<Result<string[]>>}
 */
export const getLightningSeed = async (
	selectedWallet: string,
): Promise<Result<string>> => {
	try {
		if (!selectedWallet) {
			selectedWallet = getSelectedWallet();
		}
		const mnemonic = await getMnemonicPhrase(selectedWallet);
		if (mnemonic.isErr()) {
			return err(mnemonic.error.message);
		}
		const lndSeed = await deriveMnemonicPhrases(mnemonic.value);
		if (lndSeed.isErr()) {
			return err(lndSeed.error.message);
		}
		return ok(lndSeed.value.lightning);
	} catch (e) {
		return err(e);
	}
};

export const getLightningDirectory = ({
	selectedWallet,
	selectedNetwork,
}: {
	selectedWallet?: string;
	selectedNetwork?: TAvailableNetworks;
}): string => {
	try {
		if (!selectedWallet) {
			selectedWallet = getSelectedWallet();
		}
		if (!selectedNetwork) {
			selectedNetwork = getSelectedNetwork();
		}
		return `${RNFS.DocumentDirectoryPath}/${selectedWallet}${selectedNetwork}lightning`;
	} catch {
		return '';
	}
};
