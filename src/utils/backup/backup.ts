import Scheme from './protos/scheme';
import { err, ok, Result } from '../result';
import { getStore } from '../../store/helpers';
import { getKeychainValue, setKeychainValue } from '../helpers';
import { IDefaultWalletShape, TAddressType } from '../../store/types/wallet';
import { backpackRetrieve, backpackStore, IBackpackAuth } from './backpack';
import { createWallet } from '../../store/actions/wallet';
import lnd from '@synonymdev/react-native-lightning';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { updateOmnibolt } from '../../store/actions/omnibolt';
import RNFS from 'react-native-fs';
import { unzipWithPassword, zipWithPassword } from 'react-native-zip-archive';
import { getOmniboltKey } from '../omnibolt';
import { IOmniBoltWallet } from '../../store/types/omnibolt';

const backupFilePrefix = 'backpack_wallet_';

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

		const lndBackupRes = await lnd.exportAllChannelBackups();
		if (lndBackupRes.isErr()) {
			return err(lndBackupRes.error);
		}

		lndScheme.multiChanBackup = lndBackupRes.value;

		const omniBoltScheme = new Scheme.OmniBolt();

		//All omnibolt mnemonics
		for (let index = 0; index < walletKeys.length; index++) {
			const wallet: IOmniBoltWallet =
				getStore().omnibolt.wallets[walletKeys[index]];

			const key = getOmniboltKey({ selectedWallet: wallet.id });
			const { data: mnemonic } = await getKeychainValue({ key });

			omniBoltScheme.mnemonics.push(mnemonic);
		}

		//TODO we may be able to get away with backing up less data
		omniBoltScheme.walletStore = JSON.stringify(getStore().omnibolt);

		const backup = new Scheme.Backup({
			wallets,
			lnd: lndScheme,
			omniBolt: omniBoltScheme,
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

	const time = new Date().getTime();

	try {
		const backupDir = `${RNFS.DocumentDirectoryPath}/${backupFilePrefix}${time}`;

		await RNFS.mkdir(backupDir);

		const filePath = `${backupDir}/${`${backupFilePrefix}${time}`}.json`;

		await RNFS.writeFile(
			filePath,
			JSON.stringify(backupRes.value.toJSON()),
			'utf8',
		);

		if (!encryptionPassword) {
			return ok(filePath);
		}

		const encryptedFilePath = `${
			RNFS.DocumentDirectoryPath
		}/${`${backupFilePrefix}${time}`}.zip`;
		await zipWithPassword(backupDir, encryptedFilePath, encryptionPassword);

		await RNFS.unlink(backupDir);

		return ok(encryptedFilePath);
	} catch (e) {
		return err(e);
	}
};

/**
 * Recreates all wallet content from a backup byte array
 * @param bytes
 * @returns {Promise<Ok<`Restored ${number} on chain wallets and ${any} lightning channels`> | Err<unknown>>}
 */
export const restoreFromBackupObject = async (
	backup: Scheme.Backup,
): Promise<Result<string>> => {
	try {
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

		//Omni mnemonics
		const omniMnemonics = backup.omniBolt?.mnemonics || [];
		for (let index = 0; index < omniMnemonics.length; index++) {
			const key = getOmniboltKey({ selectedWallet: `wallet${index}` });
			await setKeychainValue({
				key,
				value: omniMnemonics[index],
			});
		}

		const omniBoltStore = backup.omniBolt?.walletStore;
		if (omniBoltStore) {
			updateOmnibolt(JSON.parse(omniBoltStore));
		}

		return ok(
			`Restored ${backup.wallets.length} on chain wallets and closed lightning channels`,
		);
	} catch (e) {
		return err(e);
	}
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

		return await restoreFromBackupObject(backup);
	} catch (e) {
		return err(e);
	}
};

/**
 * Restores a backup from the backpack server
 * @param auth
 * @returns {Promise<Err<unknown> | Ok<string>>}
 */
export const restoreWalletFromServer = async (
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

	return ok('Wallet restored');
};

/**
 * Restores backup from a valid JSON file
 * @param uri
 * @param password
 */
export const restoreFromFile = async (uri: string): Promise<Result<string>> => {
	try {
		const fileContent = await RNFS.readFile(uri);

		return await restoreFromBackupObject(JSON.parse(fileContent));
	} catch (e) {
		return err(e);
	}
};

/**
 * Restores a backup from an encrypted zip file
 * @param uri
 * @param password
 * @returns {Promise<Err<unknown> | Result<string>>}
 */
export const restoreFromEncryptedZip = async (
	uri: string,
	password: string,
): Promise<Result<string>> => {
	try {
		const extractedDir = await unzipWithPassword(
			uri,
			`${RNFS.DocumentDirectoryPath}/${backupFilePrefix}_restore`,
			password,
		);

		await RNFS.unlink(uri);

		//Scan the output dir for a JSON file
		const extractedFiles = await RNFS.readDir(extractedDir);
		let jsonFiles: RNFS.ReadDirItem[] = [];
		extractedFiles.forEach((file) => {
			if (file.isFile() && file.name.toLowerCase().endsWith('.json')) {
				jsonFiles.push(file);
			}
		});

		//Ensure only one JSON file is found in the archive
		if (jsonFiles.length < 1) {
			return err('No valid backup files found in archive');
		}

		if (jsonFiles.length > 1) {
			return err('Multiple backup files found in archive');
		}

		return restoreFromFile(jsonFiles[0].path);
	} catch (e) {
		return err(e);
	}
};

/**
 * Removes all local backup files
 * @return {Promise<Err<unknown> | Ok<string>>}
 */
export const cleanupBackupFiles = async (): Promise<Result<string>> => {
	const list = await RNFS.readDir(RNFS.DocumentDirectoryPath);

	try {
		for (let index = 0; index < list.length; index++) {
			const file = list[index];

			if (file.name.indexOf(backupFilePrefix) > -1) {
				await RNFS.unlink(file.path);
			}
		}

		return ok('Files removed');
	} catch (e) {
		return err(e);
	}
};
