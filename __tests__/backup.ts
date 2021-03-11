import { createWallet } from '../src/store/actions/wallet';
import {
	backpackRegister,
	backpackRetrieve,
	backpackStore,
} from '../src/utils/backup/backpack';
import WebSocket from 'ws';
import { performBackup, restoreFromBackup } from '../src/utils/backup/backup';
import { bytesToString, stringToBytes } from '../src/utils/converters';

global.WebSocket = WebSocket;

describe('Backup', () => {
	beforeAll(async () => {
		await createWallet({});
		jest.setTimeout(15000);
	});

	it('Backpack register, store and retrieve a string', async () => {
		const username = 'test-user';
		const password = 'test-password';
		const backup = stringToBytes('test-backup-content');

		const registerRes = await backpackRegister({
			username,
			password,
		});

		expect(registerRes.isOk()).toEqual(true);
		if (registerRes.isErr()) {
			return;
		}

		const storeRes = await backpackStore(backup);
		expect(storeRes.isOk()).toEqual(true);
		if (storeRes.isErr()) {
			return;
		}

		const retrieveRes = await backpackRetrieve();
		expect(retrieveRes.isOk()).toEqual(true);
		if (retrieveRes.isErr()) {
			return;
		}

		expect(bytesToString(retrieveRes.value)).toEqual(bytesToString(backup));
	});

	it('Backup and restore a wallet', async () => {
		const username = 'test-user2';
		const password = 'test-password2';

		const registerRes = await backpackRegister({
			username,
			password,
		});

		expect(registerRes.isOk()).toEqual(true);
		if (registerRes.isErr()) {
			return;
		}

		const backupRes = await performBackup();
		expect(backupRes.isOk()).toEqual(true);
		if (backupRes.isErr()) {
			return;
		}

		//TODO nuke all state before restoring

		const restoreRes = await restoreFromBackup({ username, password });
		expect(restoreRes.isOk()).toEqual(true);
		if (restoreRes.isErr()) {
			return;
		}
	});
});
