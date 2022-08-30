// import { SDK } from '@synonymdev/slashtags-sdk';
// import BackupProtocol from 'backpack-client/src/backup-protocol.js';
// import {
// 	EBackupCategories,
// 	fetchBackup,
// 	uploadBackup,
// } from '../src/utils/backup/backpack';
// import { stringToBytes } from '@synonymdev/react-native-lnurl/dist/utils/helpers';
// import { bytesToString } from '../src/utils/converters';

// const slashtagsOptions = {
// 	persist: false,
// 	protocols: [BackupProtocol],
// 	primaryKey: new Uint8Array(32), //For testing, so we don't fill up server with junk after each test
// 	swarmOpts: { relays: ['ws://167.86.102.121:45475'] },
// };

describe('Remote backups', () => {
	jest.setTimeout(30000);

	it('Backups up and restores a blob', async () => {
		//TODO add back in when server is more reliable
		expect(true).toEqual(true);
		// let sdk = await SDK.init(slashtagsOptions);
		// const slashtag = await sdk.slashtag({ name: 'bitkit_jest' });

		// const message = 'Back me up plz';
		// const category = EBackupCategories.jest;

		// const uploadRes = await uploadBackup(
		// 	slashtag,
		// 	stringToBytes(message),
		// 	category,
		// );

		// expect(uploadRes.isOk()).toEqual(true);
		// if (uploadRes.isErr()) {
		// 	return console.error(uploadRes.error);
		// }

		// const timestamp = uploadRes.value;

		// const fetchRes = await fetchBackup(slashtag, timestamp, category);
		// expect(fetchRes.isOk()).toEqual(true);
		// if (fetchRes.isErr()) {
		// 	return console.error(fetchRes.error);
		// }

		// expect(bytesToString(fetchRes.value)).toEqual(message);
	});
});
