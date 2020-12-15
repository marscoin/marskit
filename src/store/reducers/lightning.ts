import actions from '../actions/actions';
import { ILightning } from '../types/lightning';
import { lnrpc } from 'react-native-lightning/dist/rpc';

const lightning = (
	state: ILightning = {
		syncProgress: 0,
		info: lnrpc.GetInfoResponse.create(),
		state: { grpcReady: false, walletUnlocked: false, lndRunning: false },
	},
	action,
) => {
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
