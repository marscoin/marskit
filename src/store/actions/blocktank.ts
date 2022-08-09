import actions from './actions';
import { err, ok, Result } from '@synonymdev/result';
import { getDispatch } from '../helpers';
import bt, {
	IBuyChannelRequest,
	IBuyChannelResponse,
} from '@synonymdev/blocktank-client';

const dispatch = getDispatch();

export const refreshServiceList = (): Promise<Result<string>> => {
	return new Promise(async (resolve) => {
		try {
			const res = await bt.getInfo();

			dispatch({
				type: actions.UPDATE_BLOCKTANK_SERVICE_LIST,
				payload: res.services,
			});

			resolve(ok('Product list updated'));
		} catch (error) {
			resolve(err(error));
		}
	});
};

export const buyChannel = (
	req: IBuyChannelRequest,
): Promise<Result<IBuyChannelResponse>> => {
	return new Promise(async (resolve) => {
		try {
			const res = await bt.buyChannel(req);

			//Fetches and updates the user's order list
			await refreshOrder(res.order_id);

			resolve(ok(res));
		} catch (error) {
			return resolve(err(error));
		}
	});
};

export const refreshOrder = (orderId: string): Promise<Result<string>> => {
	return new Promise(async (resolve) => {
		try {
			const res = await bt.getOrder(orderId);

			dispatch({
				type: actions.UPDATE_BLOCKTANK_ORDER,
				payload: res,
			});

			resolve(ok('Order updated'));
		} catch (error) {
			return resolve(err(error));
		}
	});
};

/*
 * This resets the activity store to defaultActivityShape
 */
export const resetBlocktankStore = (): Result<string> => {
	dispatch({
		type: actions.RESET_BLOCKTANK_STORE,
	});
	return ok('');
};
