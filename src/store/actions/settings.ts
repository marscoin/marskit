import actions from "./actions";

export const updateSettings = payload => dispatch => {
	return new Promise(async resolve => {
		await dispatch({
			type: actions.UPDATE_SETTINGS,
			payload
		});
		resolve({ error: false, data: "" });
	});
};
