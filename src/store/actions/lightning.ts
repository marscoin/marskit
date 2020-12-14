import actions from "./actions";

export const updateLightning = payload => dispatch => {
	return new Promise(async resolve => {
		await dispatch({
			type: actions.UPDATE_LIGHTNING,
			payload
		});
		resolve({ error: false, data: "" });
	});
};
