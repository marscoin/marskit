import { IGetOrderResponse, IService } from '@synonymdev/blocktank-client';

export interface IBlocktank {
	serviceList: IService[];
	serviceListLastUpdated?: Date;
	orders: IGetOrderResponse[];
}
