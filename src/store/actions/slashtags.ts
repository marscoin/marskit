import actions from './actions';
import { getDispatch } from '../helpers';
import { ok, Result } from '../../utils/result';
import { defaultSlashtagsShape } from '../shapes/slashtags';
import { ISlashtagProfile } from '../types/slashtags';
const dispatch = getDispatch();

export const updateProfile = (
	name: string,
	profile: ISlashtagProfile,
): void => {
	dispatch({
		type: actions.SLASHTAGS_UPDATE_PROFILE,
		payload: { name, profile },
	});
};

export const setActiveProfile = (currentProfileName: string): void => {
	dispatch({
		type: actions.SLASHTAGS_SET_ACTIVE_PROFILE,
		payload: { currentProfileName },
	});
};

export const resetSlashtagsStore = (): Result<string> => {
	dispatch({
		type: actions.RESET_SLASHTAGS_STORE,
	});

	return ok('');
};
