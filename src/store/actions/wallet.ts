import actions from "./actions";

export const updateWallet = payload => dispatch => {
	return new Promise(async resolve => {
		await dispatch({
			type: actions.UPDATE_WALLET,
			payload
		});
		resolve({ error: false, data: "" });
	});
};
