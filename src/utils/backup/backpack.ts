import BackupProtocol from 'backpack-client/src/backup-protocol.js';
import { ok, err, Result } from '@synonymdev/result';
import { Slashtag } from '@synonymdev/slashtags-sdk';

import { name as appName, version as appVersion } from '../../../package.json';

//TODO move to env when we have a production server
//Staging server config
const sharedSecret =
	'6dabb95493023d5c45229331490a9a67fcde2a618798f9dea5c1247eabb13451';
const serverSlashtag =
	'slash://3phbmj4jkzs7b6e6t1h8jwy1u6o9w9y39nscsc6r1q89t1mxcsux5ma/';

export enum EBackupCategories {
	jest = 'bitkit.jest',
	transactions = 'bitkit.transactions',
	ldkComplete = 'bitkit.ldk.complete',
}

const backupOptions = { timeout: 30000 };

//Keep a cached backup instance for each slashtag
const backupsInstances: { [key: string]: BackupProtocol } = {};
const backupsFactory = async (slashtag: Slashtag): Promise<BackupProtocol> => {
	if (!slashtag.ready) {
		throw new Error('backupsFactory needs update');
	}
	const key = slashtag.keyPair!.publicKey.toString();
	if (!backupsInstances[key]) {
		backupsInstances[key] = slashtag.protocol(BackupProtocol);
		backupsInstances[key].setSecret(sharedSecret);

		backupsInstances[key] = slashtag.protocol(BackupProtocol);

		// Give the protocol the shared secret
		backupsInstances[key].setSecret(sharedSecret);
	}

	return backupsInstances[key];
};

/**
 * Uploads a backup to the server
 * @param slashtag
 * @param content
 * @param category
 * @returns {Promise<Ok<*> | Err<unknown>>}
 */
export const uploadBackup = async (
	slashtag: Slashtag,
	content: Uint8Array,
	category: EBackupCategories,
): Promise<Result<number>> => {
	try {
		const backups = await backupsFactory(slashtag);

		// Prepare some data to back up
		const data = {
			appName,
			appVersion,
			category,
			content,
		};

		const { timestamp } = await backups.backupData(
			serverSlashtag,
			data,
			backupOptions,
		);

		return ok(timestamp);
	} catch (e) {
		return err(e);
	}
};

/**
 * Fetches a backup from the server
 * @param slashtag
 * @param timestamp
 * @param category
 * @returns {Promise<Ok<any> | Err<unknown>>}
 */
export const fetchBackup = async (
	slashtag: Slashtag,
	timestamp: number,
	category: EBackupCategories,
): Promise<Result<Uint8Array>> => {
	try {
		const backups = await backupsFactory(slashtag);

		const original = await backups.restoreData(
			serverSlashtag,
			{
				category,
				timestamp,
			},
			backupOptions,
		);

		return ok(original.content);
	} catch (e) {
		return err(e);
	}
};
