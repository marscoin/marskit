import {
	IGetInfoResponse,
	IGetOrderResponse,
	IService,
} from '@synonymdev/blocktank-client';

export interface IBlocktank {
	serviceList: IService[];
	serviceListLastUpdated?: number;
	orders: IGetOrderResponse[];
	paidOrders: TPaidBlocktankOrders;
	info: IGetInfoResponse;
}

export type TPaidBlocktankOrders = {
	[key: string]: string;
};

export type TGeoBlockResponse = { error?: 'GEO_BLOCKED'; accept?: boolean };
