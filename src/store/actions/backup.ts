import actions from './actions';
import { err, ok, Result } from '../../utils/result';
import { getDispatch } from '../helpers';
import {
	IBackpackAuth,
	backpackRegister,
	backpackUsername,
} from '../../utils/backup/backpack';
import { IBackup } from '../types/backup';
import { backupToBackpackServer } from '../../utils/backup/backup';

const dispatch = getDispatch();

/**
 * Schedules a full backup to backpack server
 * @returns {Promise<Ok<string> | Err<string>>}
 */
export const registerBackpack = async (
	auth: IBackpackAuth,
): Promise<Result<string>> => {
	const registerRes = await backpackRegister(auth);

	if (registerRes.isErr()) {
		return err(registerRes.error);
	}

	await dispatch({
		type: actions.BACKUP_UPDATE,
		payload: { username: await backpackUsername() },
	});

	return ok('Backup registered');
};

/**
 * Sets the current state, schedules a backup if one is required
 * @returns {Promise<Ok<string> | Err<string>>}
 */
export const backupSetup = async (): Promise<Result<string>> => {
	let state: IBackup = {
		username: await backpackUsername(),
		backpackSynced: false,
	};

	//TODO check if has been backed up, schedule only if required
	performFullBackup().then();

	await dispatch({
		type: actions.BACKUP_UPDATE,
		payload: state,
	});

	return ok('Backup setup');
};

/**
 * Triggers a full remote backup
 * @return {Promise<Err<unknown> | Ok<string>>}
 */
export const performFullBackup = async (): Promise<Result<string>> => {
	const backupRes = await backupToBackpackServer();
	if (backupRes.isErr()) {
		return err(backupRes.error);
	}

	await dispatch({
		type: actions.BACKUP_UPDATE,
		payload: {
			backpackSynced: true,
			lastBackedUp: new Date(),
		},
	});

	return ok('Backup success');
};

/*
 * This resets the backup store to defaultBackupShape
 */
export const resetBackupStore = (): Result<string> => {
	dispatch({
		type: actions.RESET_BACKUP_STORE,
	});

	return ok('');
};
