import actions from '../actions/actions';
import { ISettings } from '../types/settings';
import { defaultSettingsShape } from '../shapes/settings';

const settings = (state = defaultSettingsShape, action): ISettings => {
	switch (action.type) {
		case actions.UPDATE_SETTINGS:
			return {
				...state,
				...action.payload,
			};

		case actions.RESET_SETTINGS_STORE:
		case actions.WIPE_WALLET:
			return { ...defaultSettingsShape };

		default:
			return state;
	}
};

export default settings;
