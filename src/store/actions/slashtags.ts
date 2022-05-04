import actions from './actions';
import { getDispatch } from '../helpers';
import { TBasicProfile } from '@synonymdev/react-native-slashtags';
import { ok, Result } from '../../utils/result';
const dispatch = getDispatch();

export const updateProfile = (
	name: string,
	basicProfile: TBasicProfile,
): void => {
	dispatch({
		type: actions.SLASHTAGS_UPDATE_PROFILE,
		payload: { name, basicProfile },
	});
};

export const setActiveProfile = (name: string): void => {
	dispatch({
		type: actions.SLASHTAGS_SET_ACTIVE_PROFILE,
		payload: { name },
	});
};

export const resetSlashtagsStore = (): Result<string> => {
	dispatch({
		type: actions.RESET_SLASHTAGS_STORE,
	});

	return ok('');
};
