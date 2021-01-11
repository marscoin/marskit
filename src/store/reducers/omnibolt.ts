import actions from '../actions/actions';
import { IOmniBolt } from '../types/omnibolt';
import { defaultOmniBoltShape } from '../shapes/omnibolt';

const omnibolt = (state = defaultOmniBoltShape, action): IOmniBolt => {
	switch (action.type) {
		case actions.UPDATE_OMNIBOLT:
			return {
				...state,
				...action.payload,
			};

		case actions.RESET_OMNIBOLT_STORE:
			return defaultOmniBoltShape;

		default:
			return state;
	}
};

export default omnibolt;
