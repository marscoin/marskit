import Scheme from './protos/scheme';
import { err, ok, Result } from '../result';
import { getStore } from '../../store/helpers';
import { getKeychainValue } from '../helpers';
import { createDefaultWallet } from '../wallet';
import {
	IDefaultWalletShape,
	TAddressType,
	TKeyDerivationPath,
} from '../../store/types/wallet';
import { backpackRetrieve, backpackStore } from './backpack';
import { bytesToHexString } from '../converters';

export const createBackup = async (): Promise<Result<Uint8Array>> => {
	try {
		//TODO get wallet backup details from state

		//Wallets
		const wallets: Scheme.Wallet[] = [];

		//Iterate through all wallets in state and add their mnumonic to the backup.
		//Derivation paths and address types depend on the currently selected network
		const walletKeys = Object.keys(getStore().wallet.wallets);
		for (let index = 0; index < walletKeys.length; index++) {
			const wallet: IDefaultWalletShape = getStore().wallet.wallets[
				walletKeys[index]
			];

			const { data: mnemonic } = await getKeychainValue({
				key: wallet.id,
			});

			const { selectedNetwork } = getStore().wallet;

			let addressType = Scheme.Wallet.AddressType.bech32;
			switch (wallet.addressType[selectedNetwork]) {
				case 'bech32':
					addressType = Scheme.Wallet.AddressType.bech32;
					break;
				case 'segwit':
					addressType = Scheme.Wallet.AddressType.segwit;
					break;
				case 'legacy':
					addressType = Scheme.Wallet.AddressType.legacy;
					break;
			}

			wallets.push(
				new Scheme.Wallet({
					key: wallet.id,
					mnemonic,
					passphrase: '',
					addressType,
					keyDerivationPath: wallet.keyDerivationPath[selectedNetwork],
				}),
			);
		}

		//TODO LND channels
		const lnd = new Scheme.LND();
		lnd.channelState.push('my first channel state');
		lnd.channelState.push('my second channel state');

		//TODO omni

		const backup = new Scheme.Backup({ wallets, lnd });

		return ok(Scheme.Backup.encode(backup).finish());
	} catch (e) {
		return err(e);
	}
};

export const restoreFromBackup = async (
	bytes: Uint8Array,
): Promise<Result<string>> => {
	try {
		const backup = Scheme.Backup.decode(bytes);

		//TODO we should probably validate a backup here

		//Wallets
		for (let index = 0; index < backup.wallets.length; index++) {
			const backedUpWallet = backup.wallets[index];
			const { key, mnemonic, keyDerivationPath } = backedUpWallet; //TODO get passphrase as well when we support that

			let addressType: TAddressType = 'bech32';
			switch (backedUpWallet.addressType) {
				case Scheme.Wallet.AddressType.bech32:
					addressType = 'bech32';
					break;
				case Scheme.Wallet.AddressType.segwit:
					addressType = 'segwit';
					break;
				case Scheme.Wallet.AddressType.legacy:
					addressType = 'legacy';
					break;
			}

			await createDefaultWallet({
				wallet: key!,
				addressAmount: 2,
				changeAddressAmount: 2,
				mnemonic: mnemonic!,
				keyDerivationPath: keyDerivationPath as TKeyDerivationPath,
				addressType,
			});
		}

		//TODO restore LND channels

		//TODO restore Omni

		return ok(
			`Restored ${backup.wallets.length} on chain wallets and ${
				backup.lnd?.channelState?.length ?? 0
			} lightning channels`,
		);
	} catch (e) {
		return err(e);
	}
};

/**
 * Creates a full backup and uploads to Backpack server
 * @returns {Promise<Err<unknown> | Ok<string>>}
 */
export const backupToBackpackServer = async (): Promise<Result<string>> => {
	const createRes = await createBackup();
	if (createRes.isErr()) {
		return err(createRes.error);
	}

	const backupRes = await backpackStore(createRes.value);
	if (backupRes.isErr()) {
		return err(backupRes.error);
	}

	return ok('Backup success');
};

/**
 * Verifies backup stored on backpack server is same as locally created one.
 * @returns {Promise<Err<unknown>>}
 */
export const verifyFromBackpackServer = async (): Promise<Result<string>> => {
	try {
		const remoteBackup = await backpackRetrieve();
		if (remoteBackup.isErr()) {
			return err(remoteBackup.error);
		}

		const localBackup = await createBackup();
		if (localBackup.isErr()) {
			return err(localBackup.error);
		}

		if (
			bytesToHexString(remoteBackup.value) ===
			bytesToHexString(localBackup.value)
		) {
			return ok('Verified');
		}

		return err('Remote backup out of sync with local backup');
	} catch (e) {
		return err(e);
	}
};
