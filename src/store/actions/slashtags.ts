import actions from './actions';
import { getDispatch } from '../helpers';
import { Ok, ok, Result } from '../../utils/result';
import { ISlashtags } from '../types/slashtags';

const dispatch = getDispatch();

export const setOnboardingProfileStep = (
	step: ISlashtags['onboardingProfileStep'],
): Result<string> => {
	dispatch({
		type: actions.SET_ONBOARDING_PROFILE_STEP,
		step,
	});
	return ok('Set onboarding profile step to: ' + step);
};

export const setVisitedContacts = (visitedContacts = true): Result<string> => {
	dispatch({
		type: actions.SET_VISITED_CONTACTS,
		visitedContacts,
	});
	return ok('Set visitedContacts to: ' + visitedContacts);
};

export const resetSlashtagsStore = (): Ok<string> => {
	dispatch({ type: actions.RESET_SLASHTAGS_STORE });
	return ok('Reset slashtags store successfully');
};
