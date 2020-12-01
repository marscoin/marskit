import actions from "../actions/actions";
import { IWallet } from "../types/wallet";

const wallet = (state: IWallet = {
	loading: false,
	error: false,
	selectedNetwork: "bitcoin",
	selectedWallet: "wallet0",
	wallets: {}
}, action) => {
	switch (action.type) {

		case actions.UPDATE_WALLET:
			return {
				...state,
				...action.payload
			};

		default:
			return state;

	}
};

export default wallet;
