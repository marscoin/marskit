import actions from "../actions/actions";

const user = (state = {
	loading: false,
	error: false,
	errorTitle: "",
	errorMsg: "",
	isHydrated: false,
	isOnline: true
}, action) => {
	switch (action.type) {

		case actions.UPDATE_USER:
			return {
				...state,
				...action.payload
			};

		default:
			return state;

	}
};

export default user;
