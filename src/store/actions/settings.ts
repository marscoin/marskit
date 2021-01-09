import actions from './actions';
import { getDispatch } from '../helpers';
import { ok, Result } from '../../utils/result';

const dispatch = getDispatch();

export const updateSettings = (payload): Result<string> => {
	dispatch({
		type: actions.UPDATE_WALLET,
		payload,
	});
	return ok('');
};

/*
 * This resets the settings store to defaultSettingsShape
 */
export const resetSettingsStore = (): Result<string> => {
	dispatch({
		type: actions.RESET_SETTINGS_STORE,
	});
	return ok('');
};
