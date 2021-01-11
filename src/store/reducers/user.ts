import actions from '../actions/actions';
import { IUser } from '../types/user';
import { defaultUserShape } from '../shapes/user';

const user = (state: IUser = defaultUserShape, action): IUser => {
	switch (action.type) {
		case actions.UPDATE_USER:
			return {
				...state,
				...action.payload,
			};

		case actions.RESET_USER_STORE:
			return defaultUserShape;

		default:
			return state;
	}
};

export default user;
