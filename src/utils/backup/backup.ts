import Scheme from './protos/scheme';
import { err, ok, Result } from '../result';
import { getStore } from '../../store/helpers';
import { getKeychainValue } from '../helpers';
import { IDefaultWalletShape, TAddressType } from '../../store/types/wallet';
import { backpackRetrieve, backpackStore } from './backpack';
import { bytesToHexString } from '../converters';
import { createWallet } from '../../store/actions/wallet';
import lnd from 'react-native-lightning';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

		//LND multi channel backup and seed required to decrypt backup
		const lndScheme = new Scheme.LND();
		let lndSeed = (await getKeychainValue({ key: 'lndMnemonic' })).data;
		if (lndSeed) {
			lndScheme.seed = lndSeed;
		}

		const backupRes = await lnd.exportAllChannelBackups();
		if (backupRes.isErr()) {
			return err(backupRes.error);
		}

		lndScheme.multiChanBackup = backupRes.value;

		//TODO omni

		const backup = new Scheme.Backup({
			wallets,
			lnd: lndScheme,
			timestampUtc: new Date().getTime(),
		});

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

			await createWallet({
				walletName: key!,
				addressAmount: 2,
				changeAddressAmount: 2,
				mnemonic: mnemonic!,
				// @ts-ignore
				keyDerivationPath,
				addressType,
			});
		}

		//Cache static channel state backup for funds to be swept when creating LND wallet
		const multiChanBackup = backup.lnd?.multiChanBackup;
		if (multiChanBackup) {
			await AsyncStorage.setItem('multiChanBackupRestore', multiChanBackup);
		}

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
export const verifyFromBackpackServer = async (): Promise<Result<Date>> => {
	try {
		const remoteBackup = await backpackRetrieve();
		if (remoteBackup.isErr()) {
			return err(remoteBackup.error);
		}

		const localBackup = await createBackup();
		if (localBackup.isErr()) {
			return err(localBackup.error);
		}

		if (!remoteBackup.value) {
			return err('No remote backup');
		}

		//Verify with LND daemon that mutliChannelBackup is correct
		const remoteBackupDecoded = Scheme.Backup.decode(remoteBackup.value);
		const lndBackupVerifyRes = await lnd.verifyMultiChannelBackup(
			remoteBackupDecoded.lnd?.multiChanBackup ?? '',
		);

		if (lndBackupVerifyRes.isErr()) {
			return err(lndBackupVerifyRes.error);
		}

		return ok(new Date(Number(remoteBackupDecoded.timestampUtc)));
	} catch (e) {
		return err(e);
	}
};
