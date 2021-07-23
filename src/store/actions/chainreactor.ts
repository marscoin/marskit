import actions from './actions';
import { err, ok, Result } from '../../utils/result';
import { getDispatch } from '../helpers';
import cr from '../../utils/chainreactor';

const dispatch = getDispatch();

export const refreshServiceList = (): Promise<Result<string>> => {
	return new Promise(async (resolve) => {
		const res = await cr.getInfo();
		if (res.isErr()) {
			return err(res.error);
		}

		await dispatch({
			type: actions.UPDATE_CHAIN_REACTOR_SERVICE_LIST,
			payload: res.value.services,
		});

		resolve(ok('Product list updated'));
	});
};

/*
 * This resets the activity store to defaultActivityShape
 */
export const resetChainReactorStore = (): Result<string> => {
	dispatch({
		type: actions.RESET_CHAIN_REACTOR_STORE,
	});
	return ok('');
};
