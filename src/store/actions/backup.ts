import actions from './actions';
import { ok, Result } from '@synonymdev/result';
import { getDispatch } from '../helpers';

const dispatch = getDispatch();

/**
 * Triggers a full remote backup
 * @return {Promise<Result<string>>}
 */
export const performFullBackup = async (): Promise<Result<string>> => {
	//TODO
	//TODO(slashtags): Send all drives (public + contacts) to the seeding server.
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
