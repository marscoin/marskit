import Store from '../types';
import { createSelector } from '@reduxjs/toolkit';
import { IGetOrderResponse, IService } from '@synonymdev/blocktank-client';
import { TPaidBlocktankOrders } from '../types/blocktank';

const serviceListState = (state: Store): IService[] =>
	state.blocktank.serviceList;
const blocktankOrdersState = (state: Store): IGetOrderResponse[] =>
	state.blocktank.orders;
const blocktankPaidOrdersState = (state: Store): TPaidBlocktankOrders =>
	state.blocktank.paidOrders;

export const blocktankServiceListSelector = createSelector(
	serviceListState,
	(serviceList): IService[] => serviceList,
);
export const blocktankOrdersSelector = createSelector(
	blocktankOrdersState,
	(orders): IGetOrderResponse[] => orders ?? [],
);
export const blocktankPaidOrdersSelector = createSelector(
	blocktankPaidOrdersState,
	(paidOrders): TPaidBlocktankOrders => paidOrders,
);
