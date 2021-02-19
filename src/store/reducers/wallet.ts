import actions from '../actions/actions';
import { defaultOnChainTransactionData, IWallet } from '../types/wallet';
import { defaultWalletStoreShape } from '../shapes/wallet';

const wallet = (state = defaultWalletStoreShape, action): IWallet => {
	let selectedWallet = state.selectedWallet;
	let selectedNetwork = state.selectedNetwork;
	if (action.payload?.selectedWallet) {
		selectedWallet = action.payload.selectedWallet;
	}
	if (action.payload?.selectedNetwork) {
		selectedNetwork = action.payload.selectedNetwork;
	}
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
					[selectedWallet]: {
						...state.wallets[selectedWallet],
						addressIndex: {
							...state.wallets[selectedWallet].addressIndex,
							[selectedNetwork]: {
								...action.payload.addressIndex,
							},
						},
						changeAddressIndex: {
							...state.wallets[selectedWallet].changeAddressIndex,
							[selectedNetwork]: {
								...action.payload.changeAddressIndex,
							},
						},
					},
				},
			};

		case actions.UPDATE_WALLET_BALANCE:
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
					[selectedWallet]: {
						...state.wallets[selectedWallet],
						addresses: {
							...state.wallets[selectedWallet].addresses,
							[selectedNetwork]: {
								...state.wallets[selectedWallet].addresses[selectedNetwork],
								...action.payload.addresses,
							},
						},
						changeAddresses: {
							...state.wallets[selectedWallet].changeAddresses,
							[selectedNetwork]: {
								...state.wallets[selectedWallet].changeAddresses[
									selectedNetwork
								],
								...action.payload.changeAddresses,
							},
						},
					},
				},
			};

		case actions.UPDATE_UTXOS:
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
			const wallets = state.wallets;
			delete wallets[selectedWallet];
			return {
				...state,
				wallets: {
					...wallets,
				},
			};

		case actions.UPDATE_ON_CHAIN_TRANSACTION:
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

		case actions.SETUP_ON_CHAIN_TRANSACTION:
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
								changeAddress: action.payload.changeAddress,
								utxos: action.payload.utxos,
								outputs: action.payload.outputs,
								fee: action.payload.fee,
							},
						},
					},
				},
			};

		case actions.UPDATE_TRANSACTION_OUTPUT:
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
								outputs: action.payload.outputs,
							},
						},
					},
				},
			};

		case actions.RESET_OUTPUTS:
			return {
				...state,
				wallets: {
					...state.wallets,
					[selectedWallet]: {
						...state.wallets[selectedWallet],
						outputs: {
							...state.wallets[selectedWallet].outputs,
							[selectedNetwork]: [],
						},
					},
				},
			};

		case actions.RESET_ON_CHAIN_TRANSACTION:
			return {
				...state,
				wallets: {
					...state.wallets,
					[selectedWallet]: {
						...state.wallets[selectedWallet],
						transaction: {
							...state.wallets[selectedWallet].transaction,
							[selectedNetwork]: {
								...defaultOnChainTransactionData,
								outputs: [],
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
