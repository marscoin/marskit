import actions from '../actions/actions';
import { ILightning } from '../types/lightning';
import { defaultLightningShape } from '../shapes/lightning';

const lightning = (state: ILightning, action): ILightning => {
	switch (action.type) {
		case actions.UPDATE_LIGHTNING_STATE:
			return {
				...state,
				state: action.payload,
			};
		case actions.UPDATE_LIGHTNING_INFO:
			return {
				...state,
				info: action.payload,
			};
		case actions.CREATE_LIGHTNING_WALLET:
			return {
				...state,
				...defaultLightningShape,
			};
		case actions.RESET_LIGHTNING_STORE:
		case actions.WIPE_WALLET:
			return { ...defaultLightningShape };
		default:
			return {
				...defaultLightningShape,
				...state,
			};
	}
};

export default lightning;
