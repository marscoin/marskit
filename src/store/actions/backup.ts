import actions from './actions';
import { ok, err, Result } from '@synonymdev/result';
import { getDispatch } from '../helpers';
import { EBackupCategories, uploadBackup } from '../../utils/backup/backpack';
import { stringToBytes } from '../../utils/converters';
import { Slashtag } from '../../hooks/slashtags';
import { exportBackup } from '../../utils/lightning';
import { TAccountBackup } from '@synonymdev/react-native-ldk';

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
	backup: TAccountBackup | undefined = undefined,
): Promise<Result<string>> => {
	dispatch({
		type: actions.BACKUP_UPDATE,
		payload: { remoteLdkBackupSynced: false },
	});

	let backupString = '';
	//Automated backup events pass the latest state through
	if (backup) {
		backupString = JSON.stringify(backup);
	} else {
		const ldkBackup = await exportBackup();
		if (ldkBackup.isErr()) {
			return err(ldkBackup.error);
		}

		backupString = JSON.stringify(ldkBackup.value);
	}

	const res = await uploadBackup(
		slashtag,
		stringToBytes(backupString),
		EBackupCategories.ldkComplete,
	);

	if (res.isErr()) {
		return err(res.error);
	}

	dispatch({
		type: actions.BACKUP_UPDATE,
		payload: {
			remoteLdkBackupSynced: true,
			remoteLdkBackupLastSync: new Date().getTime(),
		},
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
			remoteLdkBackupLastSync: undefined,
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
