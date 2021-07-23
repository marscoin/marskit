import { IService } from '../../utils/chainreactor/types';

export interface IChainReactor {
	serviceList: IService[];
	lastUpdated?: Date;
}
