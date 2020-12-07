import actions from "../actions/actions";
import themes from '../../styles/themes';
import { ISettings } from "../types/settings";

const settings = (state: ISettings = {
	loading: false,
	error: false,
	biometrics: false,
	pin: false,
	pinAttemptsRemaining: 5,
	theme: themes.dark
}, action) => {
	switch (action.type) {

	case actions.UPDATE_SETTINGS:
		return {
			...state,
			...action.payload
		};

	default:
		return state;

	}
};

export default settings;
