import actions from '../actions/actions';
import { defaultBackupShape } from '../shapes/backup';
import { IBackup } from '../types/backup';

const backup = (state: IBackup, action): IBackup => {
	switch (action.type) {
		case actions.BACKUP_UPDATE:
			return {
				...state,
				...action.payload,
			};
		case actions.RESET_BACKUP_STORE:
		case actions.WIPE_WALLET:
			return { ...defaultBackupShape };
		default:
			return {
				...defaultBackupShape,
				...state,
			};
	}
};

export default backup;
