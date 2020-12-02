import actions from "./actions";

export const updateOmnibolt = payload => dispatch => {
	return new Promise(async resolve => {
		await dispatch({
			type: actions.UPDATE_OMNIBOLT,
			payload
		});
		resolve({ error: false, data: "" });
	});
};
