import actions from './actions';
import { getDispatch } from '../helpers';
import { Ok, ok, Result } from '../../utils/result';
import { ISlashtags } from '../types/slashtags';

const dispatch = getDispatch();

/**
 * Sets the onboarding profile state.
 */
export const setOnboardingProfileStep = (
	step: ISlashtags['onboardingProfileStep'],
): Result<string> => {
	dispatch({
		type: actions.SET_ONBOARDING_PROFILE_STEP,
		step,
	});
	return ok('Set onboarding profile step to: ' + step);
};

/**
 * Set onboardedContacts state.
 */
export const setOnboardedContacts = (
	onboardedContacts = true,
): Result<string> => {
	dispatch({
		type: actions.SET_VISITED_CONTACTS,
		onboardedContacts,
	});
	return ok('Set onboardedContacts to: ' + onboardedContacts);
};

/**
 * Resets slasthags store to the default state.
 */
export const resetSlashtagsStore = (): Ok<string> => {
	dispatch({ type: actions.RESET_SLASHTAGS_STORE });
	return ok('Reset slashtags store successfully');
};
