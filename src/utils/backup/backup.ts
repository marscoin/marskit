import Scheme from './protos/scheme';
import { err, ok, Result } from '../result';
import { getStore } from '../../store/helpers';
import { getKeychainValue } from '../helpers';
import { IDefaultWalletShape, TAddressType } from '../../store/types/wallet';
import { backpackRetrieve, backpackStore } from './backpack';
import { createWallet } from '../../store/actions/wallet';
import lnd from '@synonymdev/react-native-lightning';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNFS from 'react-native-fs';
import { zipWithPassword } from 'react-native-zip-archive';

const createBackupObject = async (): Promise<Result<Scheme.Backup>> => {
	try {
		//TODO get wallet backup details from state

		//Wallets
		const wallets: Scheme.Wallet[] = [];

		//Iterate through all wallets in state and add their mnumonic to the backup.
		//Derivation paths and address types depend on the currently selected network
		const walletKeys = Object.keys(getStore().wallet.wallets);
		for (let index = 0; index < walletKeys.length; index++) {
			const wallet: IDefaultWalletShape =
				getStore().wallet.wallets[walletKeys[index]];

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

		return ok(backup);
	} catch (e) {
		return err(e);
	}
};

/**
 * Creates a complete backup returned as a byte array
 * @returns {Promise<Ok<Uint8Array> | Err<unknown>>}
 */
export const createBackup = async (): Promise<Result<Uint8Array>> => {
	const backup = await createBackupObject();
	if (backup.isErr()) {
		return err(backup.error);
	}

	return ok(Scheme.Backup.encode(backup.value).finish());
};

/**
 * Recreates all wallet content from a backup byte array
 * @param bytes
 * @returns {Promise<Ok<`Restored ${number} on chain wallets and ${any} lightning channels`> | Err<unknown>>}
 */
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
			`Restored ${backup.wallets.length} on chain wallets and lightning channels`,
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

/**
 * Creates a full backup and saves to local file
 * @return {Promise<Err<unknown> | Ok<string>>}
 */
export const createBackupFile = async (
	encryptionPassword?: string,
): Promise<Result<string>> => {
	const backupRes = await createBackupObject();
	if (backupRes.isErr()) {
		return err(backupRes.error);
	}

	try {
		const backupDir = `${
			RNFS.DocumentDirectoryPath
		}/backup_${new Date().getTime()}`;

		await RNFS.mkdir(backupDir);

		const backupFilePrefix = `backpack_wallet_${new Date().getTime()}`;
		const filePath = `${backupDir}/${backupFilePrefix}.json`;

		await RNFS.writeFile(
			filePath,
			JSON.stringify(backupRes.value.toJSON()),
			'utf8',
		);

		if (!encryptionPassword) {
			return ok(filePath);
		}

		const encryptedFilePath = `${RNFS.DocumentDirectoryPath}/${backupFilePrefix}.zip`;
		await zipWithPassword(backupDir, encryptedFilePath, encryptionPassword);

		await RNFS.unlink(backupDir);

		return ok(encryptedFilePath);
	} catch (e) {
		return err(e);
	}
};
