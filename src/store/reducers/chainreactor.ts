import actions from '../actions/actions';
import { defaultChainReactorShape } from '../shapes/chainreactor';
import { IChainReactor } from '../types/chainreactor';

const chainreactor = (state: IChainReactor, action): IChainReactor => {
	switch (action.type) {
		case actions.UPDATE_CHAIN_REACTOR_SERVICE_LIST:
			return {
				...state,
				serviceList: action.payload,
				lastUpdated: new Date(),
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
