import actions from '../actions/actions';
import { IOmniBolt } from '../types/omnibolt';
import { EWallet } from '../types/wallet';

const omnibolt = (
	state: IOmniBolt = {
		loading: false,
		error: false,
		selectedNetwork: EWallet.selectedNetwork,
		selectedWallet: EWallet.defaultWallet,
		wallets: {},
	},
	action,
): IOmniBolt => {
	switch (action.type) {
		case actions.UPDATE_OMNIBOLT:
			return {
				...state,
				...action.payload,
			};

		default:
			return state;
	}
};

export default omnibolt;
