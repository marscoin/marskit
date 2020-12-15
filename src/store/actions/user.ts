import actions from './actions';

export const updateUser = (payload) => (dispatch) => {
	return new Promise(async (resolve) => {
		await dispatch({
			type: actions.UPDATE_USER,
			payload,
		});
		resolve({ error: false, data: '' });
	});
};
