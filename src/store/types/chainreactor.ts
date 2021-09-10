import { IGetOrderResponse, IService } from '@synonymdev/blocktank-client';

export interface IChainReactor {
	serviceList: IService[];
	serviceListLastUpdated?: Date;
	orders: IGetOrderResponse[];
}
