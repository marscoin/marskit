import actions from '../actions/actions';
import { defaultChainReactorShape } from '../shapes/chainreactor';
import { IChainReactor } from '../types/chainreactor';
import { IGetOrderResponse } from '../../utils/chainreactor/types';

const chainreactor = (state: IChainReactor, action): IChainReactor => {
	switch (action.type) {
		case actions.UPDATE_CHAIN_REACTOR_SERVICE_LIST:
			return {
				...state,
				serviceList: action.payload,
				serviceListLastUpdated: new Date(),
			};
		case actions.UPDATE_CHAIN_REACTOR_ORDER:
			//Find existing order and update it if it exists, else append to list
			const updatedOrder: IGetOrderResponse = action.payload;

			let orders = state.orders;
			let existingOrderIndex = -1;
			orders.forEach((o, index) => {
				if (o._id === updatedOrder._id) {
					existingOrderIndex = index;
				}
			});

			if (existingOrderIndex > -1) {
				orders[existingOrderIndex] = updatedOrder;
			} else {
				orders.push(updatedOrder);
			}

			return {
				...state,
				orders,
			};
		case actions.RESET_CHAIN_REACTOR_STORE:
			return { ...defaultChainReactorShape };
		default:
			return {
				...defaultChainReactorShape,
				...state,
			};
	}
};

export default chainreactor;
