import actions from './actions';
import { ok, err, Result } from '@synonymdev/result';
import { getDispatch } from '../helpers';
import { EBackupCategories, uploadBackup } from '../../utils/backup/backpack';
import { stringToBytes } from '../../utils/converters';
import { Slashtag } from '../../hooks/slashtags';
import { exportBackup } from '../../utils/lightning';

const dispatch = getDispatch();

/**
 * Triggers a full remote backup
 * @return {Promise<Result<string>>}
 */
export const performFullBackup = async (
	slashtag: Slashtag,
): Promise<Result<string>> => {
	const ldkRemoteRes = await performRemoteLdkBackup(slashtag);
	//TODO perform other backup types

	//TODO(slashtags): Send all drives (public + contacts) to the seeding server.

	//TODO check results of each time and return errors if any

	if (ldkRemoteRes.isErr()) {
		return err(ldkRemoteRes.error);
	}

	return ok('Backup success');
};

export const performRemoteLdkBackup = async (
	slashtag: Slashtag,
): Promise<Result<string>> => {
	dispatch({
		type: actions.BACKUP_UPDATE,
		payload: { remoteLdkBackupSynced: false },
	});

	const ldkBackup = await exportBackup();
	if (ldkBackup.isErr()) {
		return err(ldkBackup.error);
	}

	const res = await uploadBackup(
		slashtag,
		stringToBytes(JSON.stringify(ldkBackup.value)),
		EBackupCategories.ldkComplete,
	);

	if (res.isErr()) {
		return err(res.error);
	}

	dispatch({
		type: actions.BACKUP_UPDATE,
		payload: { remoteLdkBackupSynced: true },
	});

	return ok('Backup success');
};

export const setRemoteBackupsEnabled = (
	remoteBackupsEnabled: boolean,
): void => {
	dispatch({
		type: actions.BACKUP_UPDATE,
		payload: {
			remoteBackupsEnabled,
			remoteLdkBackupLastSync: new Date().getTime(),
		},
	});
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
