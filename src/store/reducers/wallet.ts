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
): IWallet => {
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

		case actions.UPDATE_ADDRESS_INDEX:
			return {
				...state,
				wallets: {
					...state.wallets,
					[state.selectedWallet]: {
						...state.wallets[state.selectedWallet],
						addressIndex: {
							...state.wallets[state.selectedWallet].addressIndex,
							[state.selectedNetwork]: {
								...action.payload.addressIndex,
							},
						},
						changeAddressIndex: {
							...state.wallets[state.selectedWallet].changeAddressIndex,
							[state.selectedNetwork]: {
								...action.payload.changeAddressIndex,
							},
						},
					},
				},
			};

		case actions.ADD_ADDRESSES:
			return {
				...state,
				wallets: {
					...state.wallets,
					[state.selectedWallet]: {
						...state.wallets[state.selectedWallet],
						addresses: {
							...state.wallets[state.selectedWallet].addresses,
							[state.selectedNetwork]: {
								...state.wallets[state.selectedWallet].addresses[
									state.selectedNetwork
								],
								...action.payload.addresses,
							},
						},
						changeAddresses: {
							...state.wallets[state.selectedWallet].changeAddresses,
							[state.selectedNetwork]: {
								...state.wallets[state.selectedWallet].changeAddresses[
									state.selectedNetwork
								],
								...action.payload.changeAddresses,
							},
						},
					},
				},
			};

		default:
			return state;
	}
};

export default wallet;
