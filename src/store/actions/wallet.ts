import actions from './actions';
import {
	EWallet,
	ICreateWallet,
	IFormattedTransaction,
	IOnChainTransactionData,
	IOutput,
	IUtxo,
} from '../types/wallet';
import {
	createDefaultWallet,
	formatTransactions,
	generateAddresses,
	getAddressHistory,
	getCurrentWallet,
	getExchangeRate,
	getNextAvailableAddress,
	getSelectedNetwork,
	getSelectedWallet,
	getTransactions,
	getUtxos,
	ITransaction,
	refreshWallet,
} from '../../utils/wallet';
import { getDispatch, getStore } from '../helpers';
import { TAvailableNetworks } from '../../utils/networks';
import { err, ok, Result } from '../../utils/result';
import {
	IGenerateAddresses,
	IGenerateAddressesResponse,
} from '../../utils/types';
import { createOmniboltWallet } from './omnibolt';
import {
	getTotalFee,
	getTransactionUtxoValue,
} from '../../utils/wallet/transactions';

const dispatch = getDispatch();

export const updateWallet = (payload): Promise<Result<string>> => {
	return new Promise(async (resolve) => {
		await dispatch({
			type: actions.UPDATE_WALLET,
			payload,
		});
		resolve(ok(''));
	});
};

/**
 * Creates and stores a newly specified wallet.
 * @param {string} [wallet]
 * @param {number} [addressAmount]
 * @param {number} [changeAddressAmount]
 * @param {string} [mnemonic]
 * @param {string} [keyDerivationPath]
 * @param {string} [addressType]
 * @return {Promise<Result<string>>}
 */
export const createWallet = async ({
	wallet = 'wallet0',
	addressAmount = 2,
	changeAddressAmount = 2,
	mnemonic = '',
	keyDerivationPath = '84',
	addressType = 'bech32',
}: ICreateWallet): Promise<Result<string>> => {
	try {
		const response = await createDefaultWallet({
			wallet,
			addressAmount,
			changeAddressAmount,
			mnemonic,
			keyDerivationPath,
			addressType,
		});
		if (response.isErr()) {
			return err(response.error.message);
		}
		await dispatch({
			type: actions.CREATE_WALLET,
			payload: response.value,
		});

		await createOmniboltWallet({ selectedWallet: wallet });
		return ok('');
	} catch (e) {
		return err(e);
	}
};

export const updateExchangeRate = (): Promise<Result<string>> => {
	return new Promise(async (resolve) => {
		const settings = getStore().settings;
		const { selectedCurrency, exchangeRateService } = settings;
		const response = await getExchangeRate({
			selectedCurrency,
			exchangeRateService,
		});
		if (!response.error) {
			await dispatch({
				type: actions.UPDATE_WALLET,
				payload: { exchangeRate: response.data },
			});
			resolve(ok('Successfully updated the exchange rate.'));
		} else {
			resolve(err('Unable to acquire exchange rate data.'));
		}
	});
};

export const updateAddressIndexes = ({
	selectedWallet = undefined,
	selectedNetwork = undefined,
}: {
	selectedWallet?: string | undefined;
	selectedNetwork?: TAvailableNetworks | undefined;
}): Promise<Result<string>> => {
	return new Promise(async (resolve) => {
		if (!selectedNetwork) {
			selectedNetwork = getSelectedNetwork();
		}
		if (!selectedWallet) {
			selectedWallet = getSelectedWallet();
		}

		const response = await getNextAvailableAddress({
			selectedWallet,
			selectedNetwork,
		});
		if (response.isErr()) {
			return resolve(err(response.error));
		}
		const { currentWallet } = getCurrentWallet({
			selectedWallet,
			selectedNetwork,
		});
		let addressIndex = currentWallet.addressIndex[selectedNetwork];
		let changeAddressIndex = currentWallet.changeAddressIndex[selectedNetwork];
		if (
			response.value.addressIndex.index !==
				currentWallet.addressIndex[selectedNetwork].index ||
			response.value.changeAddressIndex.index !==
				currentWallet.changeAddressIndex[selectedNetwork].index
		) {
			if (response.value?.addressIndex) {
				addressIndex = response.value.addressIndex;
			}

			if (response.value?.changeAddressIndex) {
				changeAddressIndex = response.value?.changeAddressIndex;
			}

			await dispatch({
				type: actions.UPDATE_ADDRESS_INDEX,
				payload: {
					addressIndex,
					changeAddressIndex,
				},
			});
			return resolve(ok('Successfully updated indexes.'));
		}
		return resolve(ok('No update needed.'));
	});
};

export const addAddresses = ({
	wallet = EWallet.defaultWallet,
	addressAmount = 5,
	changeAddressAmount = 5,
	addressIndex = 0,
	changeAddressIndex = 0,
	selectedNetwork = EWallet.selectedNetwork,
	keyDerivationPath = EWallet.keyDerivationPath,
	addressType = EWallet.addressType,
}: IGenerateAddresses): Promise<Result<IGenerateAddressesResponse>> => {
	return new Promise(async (resolve) => {
		const generatedAddresses = await generateAddresses({
			addressAmount,
			changeAddressAmount,
			addressIndex,
			changeAddressIndex,
			selectedNetwork,
			wallet,
			keyDerivationPath,
			addressType,
		});
		if (generatedAddresses.isErr()) {
			return resolve(err(generatedAddresses.error));
		}

		let addresses = generatedAddresses.value.addresses;
		let changeAddresses = generatedAddresses.value.changeAddresses;

		const { wallets } = getStore().wallet;
		const currentWallet = wallets[wallet];
		const currentAddresses = currentWallet.addresses[selectedNetwork];
		const currentChangeAddresses =
			currentWallet.changeAddresses[selectedNetwork];

		//Remove any duplicate addresses.
		await Promise.all([
			Object.keys(addresses).map((scriptHash) => {
				if (scriptHash in currentAddresses) {
					delete addresses[scriptHash];
				}
			}),
			Object.keys(changeAddresses).map((scriptHash) => {
				if (scriptHash in currentChangeAddresses) {
					delete changeAddresses[scriptHash];
				}
			}),
		]);

		const payload = {
			addresses,
			changeAddresses,
		};
		await dispatch({
			type: actions.ADD_ADDRESSES,
			payload,
		});
		return resolve(
			ok({
				addresses: generatedAddresses.value.addresses,
				changeAddresses: generatedAddresses.value.changeAddresses,
			}),
		);
	});
};

/**
 * This method serves two functions.
 * 1. Update UTXO data for all addresses and change addresses for a given wallet and network.
 * 2. Update the available balance for a given wallet and network.
 */
export const updateUtxos = ({
	selectedWallet = undefined,
	selectedNetwork = undefined,
}: {
	selectedWallet?: string | undefined;
	selectedNetwork?: TAvailableNetworks | undefined;
}): Promise<Result<{ utxos: IUtxo[]; balance: number }>> => {
	return new Promise(async (resolve) => {
		if (!selectedNetwork) {
			selectedNetwork = getSelectedNetwork();
		}
		if (!selectedWallet) {
			selectedWallet = getSelectedWallet();
		}

		const utxoResponse = await getUtxos({ selectedWallet, selectedNetwork });
		if (utxoResponse.isErr()) {
			return resolve(err(utxoResponse.error));
		}
		const { utxos, balance } = utxoResponse.value;
		const payload = {
			selectedWallet,
			selectedNetwork,
			utxos,
			balance,
		};
		await dispatch({
			type: actions.UPDATE_UTXOS,
			payload,
		});
		return resolve(ok(payload));
	});
};

export const updateWalletBalance = ({
	balance = 0,
	selectedWallet = undefined,
	selectedNetwork = undefined,
}: {
	balance: number;
	selectedWallet?: string | undefined;
	selectedNetwork?: TAvailableNetworks | undefined;
}): Result<string> => {
	try {
		if (!selectedNetwork) {
			selectedNetwork = getSelectedNetwork();
		}
		if (!selectedWallet) {
			selectedWallet = getSelectedWallet();
		}
		const payload = {
			balance,
			selectedNetwork,
			selectedWallet,
		};
		dispatch({
			type: actions.UPDATE_WALLET_BALANCE,
			payload,
		});

		return ok('Successfully updated balance.');
	} catch (e) {
		return err(e);
	}
};

export interface ITransactionData {
	address: string;
	height: number;
	index: number;
	path: string;
	scriptHash: string;
	tx_hash: string;
	tx_pos: number;
	value: number;
}

export const updateTransactions = ({
	selectedWallet = undefined,
	selectedNetwork = undefined,
}: {
	selectedWallet?: string | undefined;
	selectedNetwork?: TAvailableNetworks | undefined;
}): Promise<Result<IFormattedTransaction>> => {
	return new Promise(async (resolve) => {
		if (!selectedNetwork) {
			selectedNetwork = getSelectedNetwork();
		}
		if (!selectedWallet) {
			selectedWallet = getSelectedWallet();
		}
		const { currentWallet } = getCurrentWallet({
			selectedWallet,
			selectedNetwork,
		});

		const history = await getAddressHistory({
			selectedNetwork,
			selectedWallet,
		});
		if (history.isErr()) {
			return resolve(err(history.error.message));
		}
		if (!history?.value?.length) {
			return resolve(ok({}));
		}

		const getTransactionsResponse = await getTransactions({
			txHashes: history.value || [],
			selectedNetwork,
		});
		if (getTransactionsResponse.isErr()) {
			return resolve(err(getTransactionsResponse.error.message));
		}
		let transactions: ITransaction<ITransactionData>[] =
			getTransactionsResponse.value.data;

		if (!Array.isArray(transactions)) {
			return resolve(ok({}));
		}

		const formatTransactionsResponse = await formatTransactions({
			selectedNetwork,
			selectedWallet,
			transactions,
		});
		if (formatTransactionsResponse.isErr()) {
			return resolve(err(formatTransactionsResponse.error.message));
		}

		const formattedTransactions: IFormattedTransaction = {};

		const storedTransactions =
			Object.keys(currentWallet.transactions[selectedNetwork]) || [];

		Object.keys(formatTransactionsResponse.value).forEach((txid) => {
			if (!storedTransactions.includes(txid)) {
				formattedTransactions[txid] = formatTransactionsResponse.value[txid];
			}
		});
		if (!Object.keys(formattedTransactions)?.length) {
			return resolve(ok(currentWallet.transactions[selectedNetwork]));
		}

		const payload = {
			transactions: formattedTransactions,
			selectedNetwork,
			selectedWallet,
		};
		await dispatch({
			type: actions.UPDATE_TRANSACTIONS,
			payload,
		});

		return resolve(ok(formattedTransactions));
	});
};

/**
 * This does not delete the stored mnemonic phrase for a given wallet.
 * This resets a given wallet to defaultWalletShape
 */
export const resetSelectedWallet = async ({
	selectedWallet = undefined,
}: {
	selectedWallet?: string;
}): Promise<void> => {
	if (!selectedWallet) {
		selectedWallet = getSelectedWallet();
	}
	await dispatch({
		type: actions.RESET_SELECTED_WALLET,
		payload: {
			selectedWallet,
		},
	});
	await createWallet({ wallet: selectedWallet });
	await refreshWallet();
};

/**
 * This does not delete the stored mnemonic phrases on the device.
 * This resets the wallet store to defaultWalletStoreShape
 */
export const resetWalletStore = async (): Promise<Result<string>> => {
	dispatch({
		type: actions.RESET_WALLET_STORE,
	});
	await createWallet({ wallet: EWallet.defaultWallet });
	await refreshWallet();
	return ok('');
};

export const setupOnChainTransaction = ({
	selectedWallet = undefined,
	selectedNetwork = undefined,
}: {
	selectedWallet?: string | undefined;
	selectedNetwork?: TAvailableNetworks | undefined;
}): void => {
	try {
		if (!selectedNetwork) {
			selectedNetwork = getSelectedNetwork();
		}
		if (!selectedWallet) {
			selectedWallet = getSelectedWallet();
		}

		const { currentWallet } = getCurrentWallet({
			selectedWallet,
			selectedNetwork,
		});
		const utxos = currentWallet.utxos[selectedNetwork];
		const outputs = currentWallet.transaction[selectedNetwork].outputs || [];
		let changeAddresses = currentWallet.changeAddresses[selectedNetwork];
		const changeAddressesArr = Object.values(changeAddresses).map(
			({ address }) => address,
		);
		const changeAddress =
			currentWallet.changeAddressIndex[selectedNetwork].address;
		const fee = getTotalFee({
			satsPerByte: 1,
			message: '',
		});
		//Remove any potential change address that may have been included from a previous tx attempt.
		const newOutputs = outputs.filter((output) => {
			if (!changeAddressesArr.includes(output.address)) {
				return output;
			}
		});

		const payload = {
			selectedNetwork,
			selectedWallet,
			utxos,
			changeAddress,
			fee,
			outputs: newOutputs,
		};
		dispatch({
			type: actions.SETUP_ON_CHAIN_TRANSACTION,
			payload,
		});
	} catch {}
};

export interface IUpdateOutput extends IOutput {
	index: number | undefined;
}

/**
 * This updates the specified on-chain transaction.
 * @param selectedWallet
 * @param selectedNetwork
 * @param transaction
 * @return {Promise<void>}
 */
export const updateOnChainTransaction = async ({
	selectedWallet = undefined,
	selectedNetwork = undefined,
	transaction,
}: {
	transaction: IOnChainTransactionData;
	selectedWallet?: string | undefined;
	selectedNetwork?: TAvailableNetworks | undefined;
}): Promise<void> => {
	try {
		if (!selectedNetwork) {
			selectedNetwork = getSelectedNetwork();
		}
		if (!selectedWallet) {
			selectedWallet = getSelectedWallet();
		}

		const utxoValue = getTransactionUtxoValue({
			selectedWallet,
			selectedNetwork,
		});
		if (!utxoValue) {
			await setupOnChainTransaction({ selectedWallet, selectedNetwork });
		}

		//Add output if specified
		if (transaction?.outputs) {
			let outputs =
				getStore().wallet.wallets[selectedWallet].transaction[selectedNetwork]
					.outputs || [];
			await Promise.all(
				transaction?.outputs.map((output) => {
					const outputIndex = output?.index;
					if (outputIndex === undefined || isNaN(outputIndex)) {
						//Ensure we're not pushing a duplicate address.
						const foundOutput = outputs.filter(
							(o) => o.address === output.address,
						);
						if (foundOutput?.length) {
							outputs[foundOutput.index] = output;
						} else {
							outputs.push(output);
						}
					} else {
						outputs[outputIndex] = output;
					}
				}),
			);
			transaction.outputs = outputs;
		}

		const payload = {
			selectedNetwork,
			selectedWallet,
			transaction,
		};
		dispatch({
			type: actions.UPDATE_ON_CHAIN_TRANSACTION,
			payload,
		});
	} catch {}
};

export const resetOnChainTransaction = ({
	selectedWallet = undefined,
	selectedNetwork = undefined,
}: {
	selectedWallet?: string | undefined;
	selectedNetwork?: TAvailableNetworks | undefined;
}): void => {
	try {
		if (!selectedNetwork) {
			selectedNetwork = getSelectedNetwork();
		}
		if (!selectedWallet) {
			selectedWallet = getSelectedWallet();
		}

		const payload = {
			selectedNetwork,
			selectedWallet,
		};
		dispatch({
			type: actions.RESET_ON_CHAIN_TRANSACTION,
			payload,
		});
	} catch {}
};
