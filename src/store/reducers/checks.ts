import actions from '../actions/actions';
import {
	getDefaultChecksShape,
	getDefaultChecksContent,
} from '../shapes/checks';
import { IChecksShape } from '../types/checks';

const checks = (
	state: IChecksShape = getDefaultChecksShape(),
	action,
): IChecksShape => {
	let selectedWallet;
	let selectedNetwork;
	if (action?.payload?.selectedWallet) {
		selectedWallet = action?.payload?.selectedWallet;
	}
	if (action?.payload?.selectedNetwork) {
		selectedNetwork = action.payload.selectedNetwork;
	}

	switch (action.type) {
		case actions.ADD_WARNING:
			return {
				...state,
				[selectedWallet]: {
					...state[selectedWallet],
					warnings: {
						...state[selectedWallet].warnings,
						[selectedNetwork]: [
							...state[selectedWallet].warnings[selectedNetwork],
							action.payload.warning,
						],
					},
				},
			};

		case actions.UPDATE_WARNINGS:
			return {
				...state,
				[selectedWallet]: {
					...state[selectedWallet],
					warnings: {
						...state[selectedWallet].warnings,
						[selectedNetwork]: action.payload.warnings,
					},
				},
			};

		case actions.CREATE_WALLET:
			return {
				...state,
				[Object.keys(action.payload)[0]]: getDefaultChecksContent(),
			};

		case actions.RESET_CHECKS_STORE:
		case actions.WIPE_APP:
			return getDefaultChecksShape();

		default:
			return state;
	}
};

export default checks;
