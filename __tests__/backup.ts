import { createWallet } from '../src/store/actions/wallet';
import {
	backpackRegister,
	backpackRetrieve,
	backpackStore,
} from '../src/utils/backup/backpack';
import WebSocket from 'ws';

global.WebSocket = WebSocket;

const username = 'test-user';
const password = 'test-password';

describe('Backup', () => {
	beforeAll(async () => {
		await createWallet({});
		jest.setTimeout(10000);
	});

	it('Backs up and restores a wallet from backpack', async () => {
		const registerRes = await backpackRegister({
			username,
			password,
		});

		expect(registerRes.isOk()).toEqual(true);
		if (registerRes.isErr()) {
			return;
		}

		const backup = 'yo';
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
	});
});
