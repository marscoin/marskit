import actions from '../actions/actions';
import { IWallet } from '../types/wallet';
import { defaultWalletStoreShape } from '../shapes/wallet';
import { onChainTransaction } from '../shapes/wallet';

const wallet = (state = defaultWalletStoreShape, action): IWallet => {
	let selectedWallet = state.selectedWallet;
	let selectedNetwork = state.selectedNetwork;
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

		case actions.UPDATE_WALLET_BALANCE:
			selectedWallet = action.payload.selectedWallet;
			selectedNetwork = action.payload.selectedNetwork;
			return {
				...state,
				wallets: {
					...state.wallets,
					[selectedWallet]: {
						...state.wallets[selectedWallet],
						balance: {
							...state.wallets[selectedWallet].balance,
							[selectedNetwork]: action.payload.balance,
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

		case actions.UPDATE_UTXOS:
			selectedWallet = action.payload.selectedWallet;
			selectedNetwork = action.payload.selectedNetwork;
			const { utxos, balance } = action.payload;
			return {
				...state,
				wallets: {
					...state.wallets,
					[selectedWallet]: {
						...state.wallets[selectedWallet],
						balance: {
							...state.wallets[selectedWallet].balance,
							[selectedNetwork]: balance,
						},
						utxos: {
							...state.wallets[selectedWallet].utxos,
							[selectedNetwork]: utxos,
						},
					},
				},
			};

		case actions.UPDATE_TRANSACTIONS:
			selectedWallet = action.payload.selectedWallet;
			selectedNetwork = action.payload.selectedNetwork;
			const transactions = action.payload.transactions;
			return {
				...state,
				wallets: {
					...state.wallets,
					[selectedWallet]: {
						...state.wallets[selectedWallet],
						transactions: {
							...state.wallets[selectedWallet].transactions,
							[selectedNetwork]: {
								...state.wallets[selectedWallet].transactions[selectedNetwork],
								...transactions,
							},
						},
					},
				},
			};

		case actions.RESET_WALLET_STORE:
			return defaultWalletStoreShape;

		case actions.RESET_SELECTED_WALLET:
			selectedWallet = action.payload.selectedWallet;
			const wallets = state.wallets;
			delete wallets[selectedWallet];
			return {
				...state,
				wallets: {
					...wallets,
				},
			};

		case actions.UPDATE_ON_CHAIN_TRANSACTION:
			selectedWallet = action.payload.selectedWallet;
			selectedNetwork = action.payload.selectedNetwork;
			const transaction = action.payload.transaction;
			return {
				...state,
				wallets: {
					...state.wallets,
					[selectedWallet]: {
						...state.wallets[selectedWallet],
						transaction: {
							...state.wallets[selectedWallet].transaction,
							[selectedNetwork]: {
								...state.wallets[selectedWallet].transaction[selectedNetwork],
								...transaction,
							},
						},
					},
				},
			};

		case actions.RESET_ON_CHAIN_TRANSACTION:
			selectedWallet = action.payload.selectedWallet;
			selectedNetwork = action.payload.selectedNetwork;
			return {
				...state,
				wallets: {
					...state.wallets,
					[selectedWallet]: {
						...state.wallets[selectedWallet],
						transaction: {
							...state.wallets[selectedWallet].transaction,
							[selectedNetwork]: {
								...onChainTransaction[selectedNetwork],
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
