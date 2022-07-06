import actions from './actions';
import { getDispatch } from '../helpers';
import { Ok, ok, Result } from '../../utils/result';

const dispatch = getDispatch();

export const setVisitedProfile = (visitedProfile = true): Result<string> => {
	dispatch({
		type: actions.SET_VISITED_PROFILE,
		visitedProfile,
	});
	return ok('Set visitedProfile to: ' + visitedProfile);
};

export const setVisitedContacts = (visitedContacts = true): Result<string> => {
	dispatch({
		type: actions.SET_VISITED_CONTACTS,
		visitedContacts,
	});
	return ok('Set visitedContacts to: ' + visitedContacts);
};

export const setProfileSeen = (id, version): Result<string> => {
	dispatch({
		type: actions.SET_PROFILE_SEEN,
		id,
		version,
	});

	return ok('Set profile seen to: ' + version);
};

export const resetSlashtagsStore = (): Ok<string> => {
	dispatch({ type: actions.RESET_SLASHTAGS_STORE });
	return ok('Reset slashtags store successfully');
};
