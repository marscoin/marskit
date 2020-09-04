import actions from "../actions/actions";
import { light } from '../styles/themes';

const settings = (state = {
	loading: false,
	error: false,
	errorTitle: "",
	errorMsg: "",
	biometrics: false,
	pin: false,
	pinAttemptsRemaining: 5,
	theme: light
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
