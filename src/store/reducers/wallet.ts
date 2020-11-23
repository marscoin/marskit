import actions from "../actions/actions";

const wallet = (state = {
	loading: false,
	error: false,
	errorTitle: "",
	errorMsg: "",
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
