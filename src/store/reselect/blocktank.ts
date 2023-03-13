import { createSelector } from '@reduxjs/toolkit';
import { IGetOrderResponse, IService } from '@synonymdev/blocktank-client';
import Store from '../types';
import { IBlocktank, TPaidBlocktankOrders } from '../types/blocktank';

const blocktankState = (state: Store): IBlocktank => state.blocktank;

export const blocktankSelector = (state: Store): IBlocktank => state.blocktank;
export const blocktankServiceListSelector = createSelector(
	blocktankState,
	(blocktank): IService[] => blocktank.serviceList,
);
export const blocktankServiceSelector = createSelector(
	blocktankState,
	(blocktank): IService => blocktank.serviceList[0],
);
export const blocktankOrdersSelector = createSelector(
	blocktankState,
	(blocktank): IGetOrderResponse[] => blocktank.orders,
);
/**
 * Returns a blocktank order for a given order ID.
 */
export const blocktankOrderSelector = createSelector(
	[blocktankState, (_blocktank, orderId: string): string => orderId],
	(blocktank, orderId): IGetOrderResponse => {
		return blocktank.orders.find((o) => o._id === orderId)!;
	},
);
export const blocktankPaidOrdersSelector = createSelector(
	blocktankState,
	(blocktank): TPaidBlocktankOrders => blocktank.paidOrders,
);
/**
 * Returns a paid blocktank order txid given its order ID.
 */
export const blocktankPaidOrderSelector = createSelector(
	[blocktankState, (_blocktank, orderId: string): string => orderId],
	(blocktank, orderId): string => {
		const paidBlocktankOrders = blocktank.paidOrders;
		if (orderId in paidBlocktankOrders) {
			return paidBlocktankOrders[orderId];
		}
		return '';
	},
);
export const blocktankProductIdSelector = createSelector(
	blocktankState,
	(blocktank): string => blocktank.serviceList[0]?.product_id ?? '',
);
export const blocktankNodeInfoSelector = createSelector(
	blocktankState,
	(
		blocktank,
	): {
		alias: string;
		active_channels_count: number;
		uris: string[];
		public_key: string;
	} => blocktank.info.node_info,
);
