import actions from '../actions/actions';
import { ILightning } from '../types/lightning';
import { defaultLightningShape } from '../shapes/lightning';

const lightning = (state: ILightning = defaultLightningShape, action) => {
	switch (action.type) {
		case actions.UPDATE_LIGHTNING:
			return {
				...state,
				...action.payload,
			};
		default:
			return state;
	}
};

export default lightning;
