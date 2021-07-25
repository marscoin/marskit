import { IGetOrderResponse, IService } from '../../utils/chainreactor/types';

export interface IChainReactor {
	serviceList: IService[];
	serviceListLastUpdated?: Date;
	orders: IGetOrderResponse[];
}
