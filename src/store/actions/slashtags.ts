import actions from './actions';
import { getDispatch } from '../helpers';
import { TBasicProfile, TSdkState } from '@synonymdev/react-native-slashtags';
import { ok, Result } from '../../utils/result';
import { defaultSlashtagsShape } from '../shapes/slashtags';
import { ISlashtagProfile } from '../types/slashtags';
const dispatch = getDispatch();

export const setApiReady = (apiReady: boolean): void => {
	dispatch({
		type: actions.SLASHTAGS_UPDATE_API_READY,
		payload: { apiReady },
	});

	if (!apiReady) {
		updateSdkState(defaultSlashtagsShape.sdkState);
	}

	console.info(`READY: ${apiReady}`);
};

export const updateSdkState = (sdkState: TSdkState): void => {
	dispatch({
		type: actions.SLASHTAGS_UPDATE_SDK_STATE,
		payload: { sdkState },
	});
};

export const updateProfile = (
	name: string,
	profile: ISlashtagProfile,
): void => {
	dispatch({
		type: actions.SLASHTAGS_UPDATE_PROFILE,
		payload: { name, profile },
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
