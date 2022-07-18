import actions from './actions';
import { getDispatch } from '../helpers';
import { Ok, ok, Result } from '../../utils/result';

const dispatch = getDispatch();

export const setonboardedProfile = (
	onboardedProfile = true,
): Result<string> => {
	dispatch({
		type: actions.SET_VISITED_PROFILE,
		onboardedProfile,
	});
	return ok('Set onboardedProfile to: ' + onboardedProfile);
};

export const setVisitedContacts = (visitedContacts = true): Result<string> => {
	dispatch({
		type: actions.SET_VISITED_CONTACTS,
		visitedContacts,
	});
	return ok('Set visitedContacts to: ' + visitedContacts);
};

export const setProfileVersion = (id, version): Result<string> => {
	dispatch({
		type: actions.SET_PROFILE_VERSION,
		id,
		version,
	});

	return ok('Set profile version to: ' + version);
};

export const resetSlashtagsStore = (): Ok<string> => {
	dispatch({ type: actions.RESET_SLASHTAGS_STORE });
	return ok('Reset slashtags store successfully');
};
