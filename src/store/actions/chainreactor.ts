import actions from './actions';
import { err, ok, Result } from '../../utils/result';
import { getDispatch } from '../helpers';
import cr from '../../utils/chainreactor';
import {
	IBuyChannelRequest,
	IBuyChannelResponse,
} from '../../utils/chainreactor/types';

const dispatch = getDispatch();

export const refreshServiceList = (): Promise<Result<string>> => {
	return new Promise(async (resolve) => {
		const res = await cr.getInfo();
		if (res.isErr()) {
			return resolve(err(res.error));
		}

		await dispatch({
			type: actions.UPDATE_CHAIN_REACTOR_SERVICE_LIST,
			payload: res.value.services,
		});

		resolve(ok('Product list updated'));
	});
};

export const buyChannel = (
	req: IBuyChannelRequest,
): Promise<Result<IBuyChannelResponse>> => {
	return new Promise(async (resolve) => {
		const res = await cr.buyChannel(req);
		if (res.isErr()) {
			return resolve(err(res.error));
		}

		//Fetches and updates the user's order list
		await refreshOrder(res.value.order_id);

		resolve(ok(res.value));
	});
};

export const refreshOrder = (orderId: string): Promise<Result<string>> => {
	return new Promise(async (resolve) => {
		const res = await cr.getOrder(orderId);
		if (res.isErr()) {
			return err(res.error);
		}

		await dispatch({
			type: actions.UPDATE_CHAIN_REACTOR_ORDER,
			payload: res.value,
		});

		resolve(ok('Order updated'));
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
