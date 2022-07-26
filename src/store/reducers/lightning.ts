import actions from '../actions/actions';
import { ILightning } from '../types/lightning';
import { defaultLightningShape } from '../shapes/lightning';

const lightning = (state: ILightning, action): ILightning => {
	switch (action.type) {
		case actions.UPDATE_LIGHTNING:
			return {
				...state,
				...action.payload,
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
