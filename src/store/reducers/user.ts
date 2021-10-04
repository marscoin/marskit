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

		case actions.TOGGLE_VIEW:
			return {
				...state,
				viewController: {
					...state.viewController,
					[action.payload.view]: {
						isOpen: action.payload.data.isOpen,
						snapPoint: action?.payload?.data?.snapPoint,
						id: action.payload.data.id,
					},
				},
			};

		case actions.RESET_USER_STORE:
		case actions.WIPE_WALLET:
			return { ...defaultUserShape };

		default:
			return state;
	}
};

export default user;
