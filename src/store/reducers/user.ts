import actions from "../actions/actions";
import { IUser } from "../types/user";

const user = (state: IUser = {
	loading: false,
	error: false,
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
