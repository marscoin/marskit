import actions from '../actions/actions';
import { EWallet, IWallet } from '../types/wallet';

const wallet = (
	state: IWallet = {
		loading: false,
		error: false,
		selectedNetwork: 'bitcoinTestnet',
		selectedWallet: EWallet.defaultWallet,
		exchangeRate: 0,
		wallets: {},
	},
	action,
) => {
	switch (action.type) {
		case actions.UPDATE_WALLET:
			return {
				...state,
				...action.payload,
			};

		case actions.CREATE_WALLET:
			return {
				...state,
				wallets: {
					...state.wallets,
					...action.payload,
				},
			};

		default:
			return state;
	}
};

export default wallet;
