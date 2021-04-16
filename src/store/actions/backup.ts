import actions from './actions';
import { err, ok, Result } from '../../utils/result';
import { getDispatch } from '../helpers';
import {
	IBackpackAuth,
	backpackRegister,
	backpackUsername,
} from '../../utils/backup/backpack';
import {
	backupToBackpackServer,
	verifyFromBackpackServer,
} from '../../utils/backup/backup';
import { IBackup } from '../types/backup';
import { showSuccessNotification } from '../../utils/notifications';

const dispatch = getDispatch();

/**
 * Registers and schedules a full backup to backpack server
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

	//If they've registered update that so long while we verify the backup
	await dispatch({
		type: actions.BACKUP_UPDATE,
		payload: state,
	});

	const verifyBackupRes = await verifyFromBackpackServer();
	state.backpackSynced = verifyBackupRes.isOk();
	if (verifyBackupRes.isOk()) {
		state.lastBackedUp = verifyBackupRes.value;
	}

	//If they've registered we'll have the username
	await dispatch({
		type: actions.BACKUP_UPDATE,
		payload: state,
	});

	if (verifyBackupRes.isErr()) {
		return err(`Backup not verified. ${verifyBackupRes.error.message}.`);
	}

	return ok('Backup setup');
};

/**
 * Triggers a full remote backup
 * @return {Promise<Err<unknown> | Ok<string>>}
 */
export const performFullBackup = async ({
	retries,
	retryTimeout,
}: {
	retries: number;
	retryTimeout: number;
}): Promise<Result<string>> => {
	const backupRes = await backupToBackpackServer();
	if (backupRes.isErr()) {
		if (retries > 1) {
			setTimeout(() => {
				performFullBackup({ retries: retries - 1, retryTimeout }).then();
			}, retryTimeout);
		}
		return err(backupRes.error);
	}

	await dispatch({
		type: actions.BACKUP_UPDATE,
		payload: {
			backpackSynced: true,
			lastBackedUp: new Date(),
		},
	});

	showSuccessNotification({
		title: 'Backed up to server',
		message: 'Full Backpack upload completed',
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
