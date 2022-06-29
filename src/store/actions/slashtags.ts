import actions from './actions';
import { getDispatch } from '../helpers';
import { ok, Result } from '../../utils/result';

const dispatch = getDispatch();

export const setVisitedProfile = (visitedProfile = true): Result<string> => {
	dispatch({
		type: actions.SET_VISITED_PROFILE,
		visitedProfile,
	});
	return ok('Set visited profile to: ' + visitedProfile);
};

export const resetSlashtagsStore = () => {
	dispatch({ type: actions.RESET_SLASHTAGS_STORE });
	return ok('Reset slashtags store successfully');
};
