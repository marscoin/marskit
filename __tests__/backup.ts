import { createWallet, resetWalletStore } from '../src/store/actions/wallet';
import {
	backpackRegister,
	backpackRetrieve,
	backpackStore,
} from '../src/utils/backup/backpack';
import WebSocket from 'ws';
import { createBackup, restoreFromBackup } from '../src/utils/backup/backup';
import { bytesToString, stringToBytes } from '../src/utils/converters';
import { getDispatch, getStore } from '../src/store/helpers';
import actions from '../src/store/actions/actions';
import { getKeychainValue, setKeychainValue } from '../src/utils/helpers';

global.WebSocket = WebSocket;

describe('Backup', () => {
	beforeAll(async () => {
		jest.setTimeout(15000);
	});

	it('Backpack register, store and retrieve a string (Integration)', async () => {
		const username = 'test-user';
		const password = 'test-password';
		const backupContent = `random-backup-content${Math.random()
			.toString(36)
			.substring(7)}`;

		const registerRes = await backpackRegister({
			username,
			password,
		});

		expect(registerRes.isOk()).toEqual(true);
		if (registerRes.isErr()) {
			return;
		}

		const storeRes = await backpackStore(stringToBytes(backupContent));
		expect(storeRes.isOk()).toEqual(true);
		if (storeRes.isErr()) {
			return;
		}

		const retrieveRes = await backpackRetrieve();
		expect(retrieveRes.isOk()).toEqual(true);
		if (retrieveRes.isErr()) {
			return;
		}

		expect(bytesToString(retrieveRes.value)).toEqual(backupContent);
	});

	//In the app this would be stored and retrieved from the Backpack server, a local file, iCloud or Google drive
	it('Backup a wallet to a serialised string and restore the wallet from it', async () => {
		//TODO create multiple wallets, lightning channel states, omni, etc
		const walletKey = 'wallet0'; //If we have multiple wallets one day make this an array

		await createWallet({});

		const { data: originalMnemonic } = await getKeychainValue({
			key: walletKey,
		});

		const backupRes = await createBackup();
		expect(backupRes.isOk()).toEqual(true);
		if (backupRes.isErr()) {
			return;
		}

		const backupContent = bytesToString(backupRes.value);

		//Nuke all stored seeds before restoring
		await setKeychainValue({ key: walletKey, value: '' });

		//TODO maybe also test wallets in store before and after are the same
		//TODO Test first receive and change address before and after restore to confirm we'll restore the funds as they were

		const restoreRes = await restoreFromBackup(stringToBytes(backupContent));
		expect(restoreRes.isOk()).toEqual(true);
		if (restoreRes.isErr()) {
			return;
		}

		const { data: restoredMnemonic } = await getKeychainValue({
			key: walletKey,
		});

		expect(restoredMnemonic).toEqual(originalMnemonic);
	});
});
