import actions from './actions';
import { getDispatch } from '../helpers';
import { ok, Result } from '../../utils/result';
import { IViewControllerData, TViewController } from '../types/user';

const dispatch = getDispatch();

export const updateUser = async (payload): Promise<Result<string>> => {
	await dispatch({
		type: actions.UPDATE_USER,
		payload,
	});
	return ok('');
};

export const toggleView = async (payload: {
	view: TViewController;
	data: IViewControllerData;
}): Promise<Result<string>> => {
	await dispatch({
		type: actions.TOGGLE_VIEW,
		payload,
	});
	return ok('');
};

/*
 * This reset the user store to defaultUserShape
 */
export const resetUserStore = (): Result<string> => {
	dispatch({
		type: actions.RESET_USER_STORE,
	});
	return ok('');
};
