import actions from './actions';
import {
	EWallet,
	IAddress,
	ICreateWallet,
	IFormattedTransaction,
	IOnChainTransactionData,
	IOutput,
	IUtxo,
	TAddressType,
} from '../types/wallet';
import {
	createDefaultWallet,
	formatTransactions,
	generateAddresses,
	getAddressTypes,
	getCurrentWallet,
	getKeyDerivationPathObject,
	getNextAvailableAddress,
	getSelectedAddressType,
	getSelectedNetwork,
	getSelectedWallet,
	ITransaction,
	refreshWallet,
	removeDuplicateAddresses,
} from '../../utils/wallet';
import { getDispatch, getStore } from '../helpers';
import { TAvailableNetworks } from '../../utils/networks';
import { err, ok, Result } from '../../utils/result';
import {
	getOnchainTransactionData,
	getTotalFee,
} from '../../utils/wallet/transactions';
import {
	IGenerateAddresses,
	IGenerateAddressesResponse,
} from '../../utils/types';
import { getExchangeRates } from '../../utils/exchange-rate';
import { objectsMatch } from '../../utils/helpers';
import {
	getAddressHistory,
	getTransactions,
	getUtxos,
} from '../../utils/wallet/electrum';
import { EFeeIds } from '../types/fees';

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
 * @param {IAddressType} [addressTypes]
 * @return {Promise<Result<string>>}
 */
export const createWallet = async ({
	walletName = 'wallet0',
	addressAmount = 1,
	changeAddressAmount = 1,
	mnemonic = '',
	addressTypes,
}: ICreateWallet): Promise<Result<string>> => {
	if (!addressTypes) {
		addressTypes = getAddressTypes();
	}
	try {
		const response = await createDefaultWallet({
			walletName,
			addressAmount,
			changeAddressAmount,
			mnemonic,
			addressTypes,
		});
		if (response.isErr()) {
			return err(response.error.message);
		}
		await dispatch({
			type: actions.CREATE_WALLET,
			payload: response.value,
		});
		return ok('');
	} catch (e) {
		return err(e);
	}
};

export const updateExchangeRates = async (): Promise<Result<string>> => {
	const res = await getExchangeRates();

	if (res.isErr()) {
		return err(res.error);
	}

	await dispatch({
		type: actions.UPDATE_WALLET,
		payload: { exchangeRates: res.value },
	});

	return ok('Successfully updated the exchange rate.');
};

/**
 * This method updates the next available (zero-balance) address & changeAddress index.
 * @async
 * @param {string} [selectedWallet]
 * @param {TAvailableNetworks} [selectedNetwork]
 * @param {TAddressType} [addressType]
 * @return {string}
 */
export const updateAddressIndexes = async ({
	selectedWallet,
	selectedNetwork,
	addressType, //If this param is left undefined it will update the indexes for all stored address types.
}: {
	selectedWallet?: string | undefined;
	selectedNetwork?: TAvailableNetworks | undefined;
	addressType?: TAddressType | undefined;
}): Promise<Result<string>> => {
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
	const addressTypes = getAddressTypes();
	let addressTypesToCheck = Object.keys(addressTypes);
	if (addressType) {
		addressTypesToCheck = await Promise.all(
			addressTypesToCheck.filter(
				(_addressType) => _addressType === addressType,
			),
		);
	}

	addressTypesToCheck.map(async (key) => {
		if (!selectedNetwork) {
			selectedNetwork = getSelectedNetwork();
		}
		if (!selectedWallet) {
			selectedWallet = getSelectedWallet();
		}
		const response = await getNextAvailableAddress({
			selectedWallet,
			selectedNetwork,
			addressType: key,
		});
		if (response.isErr()) {
			return err(response.error);
		}

		const { type } = addressTypes[key];
		let addressIndex = currentWallet.addressIndex[selectedNetwork][type];
		let changeAddressIndex =
			currentWallet.changeAddressIndex[selectedNetwork][type];
		if (
			response.value?.addressIndex?.path !==
				currentWallet.addressIndex[selectedNetwork][type].path ||
			response.value?.changeAddressIndex?.path !==
				currentWallet.changeAddressIndex[selectedNetwork][type].path
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
					addressType: key,
				},
			});
			return ok('Successfully updated indexes.');
		}
	});
	return ok('No update needed.');
};

/**
 * This method will generate addresses as specified and return an object of filtered addresses to ensure no duplicates are returned.
 * @async
 * @param {string} [selectedWallet]
 * @param {number} [addressAmount]
 * @param {number} [changeAddressAmount]
 * @param {number} [addressIndex]
 * @param {number} [changeAddressIndex]
 * @param {TAvailableNetworks} [selectedNetwork]
 * @param {IKeyDerivationPath} [keyDerivationPath]
 * @param {TAddressType} [addressType]
 * @return {Promise<Result<IGenerateAddressesResponse>>}
 */
export const addAddresses = async ({
	selectedWallet = undefined,
	addressAmount = 5,
	changeAddressAmount = 5,
	addressIndex = 0,
	changeAddressIndex = 0,
	selectedNetwork = undefined,
	addressType = EWallet.addressType,
	keyDerivationPath,
}: IGenerateAddresses): Promise<Result<IGenerateAddressesResponse>> => {
	if (!selectedWallet) {
		selectedWallet = getSelectedWallet();
	}
	if (!selectedNetwork) {
		selectedNetwork = getSelectedNetwork();
	}
	const addressTypes = getAddressTypes();
	const { path, type } = addressTypes[addressType];
	if (!keyDerivationPath) {
		const keyDerivationPathResponse = getKeyDerivationPathObject({
			selectedNetwork,
			path,
		});
		if (keyDerivationPathResponse.isErr()) {
			return err(keyDerivationPathResponse.error.message);
		}
		keyDerivationPath = keyDerivationPathResponse.value;
	}
	const generatedAddresses = await generateAddresses({
		addressAmount,
		changeAddressAmount,
		addressIndex,
		changeAddressIndex,
		selectedNetwork,
		selectedWallet,
		keyDerivationPath,
		addressType: type,
	});
	if (generatedAddresses.isErr()) {
		return err(generatedAddresses.error);
	}

	const removeDuplicateResponse = await removeDuplicateAddresses({
		addresses: generatedAddresses.value.addresses,
		changeAddresses: generatedAddresses.value.changeAddresses,
		selectedWallet,
		selectedNetwork,
	});

	if (removeDuplicateResponse.isErr()) {
		return err(removeDuplicateResponse.error.message);
	}

	const { addresses, changeAddresses } = removeDuplicateResponse.value;
	const payload = {
		addresses,
		changeAddresses,
		addressType,
	};
	await dispatch({
		type: actions.ADD_ADDRESSES,
		payload,
	});
	return ok(payload);
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

		const storedTransactions = currentWallet.transactions[selectedNetwork];

		const boostedTransactions =
			currentWallet.boostedTransactions[selectedNetwork];
		await Promise.all(
			boostedTransactions.map((boostedTx) => {
				if (boostedTx in storedTransactions) {
					deleteOnChainTransactionById({
						txid: boostedTx,
						selectedWallet,
						selectedNetwork,
					});
				}
			}),
		);

		Object.keys(formatTransactionsResponse.value).forEach((txid) => {
			//If the tx is new or the tx now has a block height (state changed to confirmed)
			if (
				!storedTransactions[txid] ||
				storedTransactions[txid].height !==
					formatTransactionsResponse.value[txid].height
			) {
				formattedTransactions[txid] = formatTransactionsResponse.value[txid];
			}
		});

		//No new or updated transactions
		if (!Object.keys(formattedTransactions)?.length) {
			return resolve(ok(storedTransactions));
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
 * Deletes a given on-chain trnsaction by id.
 * @param {string} txid
 * @param {string} [selectedWallet]
 * @param {TAvailableNetworks} [selectedNetwork]
 */
export const deleteOnChainTransactionById = async ({
	txid,
	selectedWallet = undefined,
	selectedNetwork = undefined,
}: {
	txid: string;
	selectedWallet?: string;
	selectedNetwork?: TAvailableNetworks;
}): Promise<void> => {
	try {
		if (!selectedNetwork) {
			selectedNetwork = getSelectedNetwork();
		}
		if (!selectedWallet) {
			selectedWallet = getSelectedWallet();
		}
		const payload = {
			txid,
			selectedNetwork,
			selectedWallet,
		};
		await dispatch({
			type: actions.DELETE_ON_CHAIN_TRANSACTION,
			payload,
		});
	} catch (e) {}
};

/**
 * Adds a boosted transaction id (typically via RBF) to the boostedTransactions array.
 * @param {string} txid
 * @param {string} [selectedWallet]
 * @param {TAvailableNetworks} [selectedNetwork]
 */
export const addBoostedTransaction = async ({
	txid,
	selectedWallet = undefined,
	selectedNetwork = undefined,
}: {
	txid: string;
	selectedWallet?: string;
	selectedNetwork?: TAvailableNetworks;
}): Promise<void> => {
	try {
		if (!selectedNetwork) {
			selectedNetwork = getSelectedNetwork();
		}
		if (!selectedWallet) {
			selectedWallet = getSelectedWallet();
		}
		const payload = {
			txid,
			selectedNetwork,
			selectedWallet,
		};
		await dispatch({
			type: actions.ADD_BOOSTED_TRANSACTION,
			payload,
		});
	} catch (e) {}
};

/**
 * Deletes a given txid from the boostedTransactions array.
 * @param {string} txid
 * @param {string} [selectedWallet]
 * @param {TAvailableNetworks} [selectedNetwork]
 */
export const deleteBoostedTransaction = async ({
	txid,
	selectedWallet = undefined,
	selectedNetwork = undefined,
}: {
	txid: string;
	selectedWallet?: string;
	selectedNetwork?: TAvailableNetworks;
}): Promise<void> => {
	try {
		if (!selectedNetwork) {
			selectedNetwork = getSelectedNetwork();
		}
		if (!selectedWallet) {
			selectedWallet = getSelectedWallet();
		}
		const payload = {
			txid,
			selectedNetwork,
			selectedWallet,
		};
		await dispatch({
			type: actions.DELETE_BOOSTED_TRANSACTION,
			payload,
		});
	} catch (e) {}
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
	await createWallet({ walletName: selectedWallet });
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
	await createWallet({});
	await refreshWallet();
	return ok('');
};

export const setupOnChainTransaction = async ({
	selectedWallet,
	selectedNetwork,
	addressType,
	rbf = true,
	submitDispatch = true,
}: {
	selectedWallet?: string;
	selectedNetwork?: TAvailableNetworks;
	addressType?: TAddressType; // Preferred address type for change address.
	rbf?: boolean; // Enable or disable rbf.
	submitDispatch?: boolean; //Should we dispatch this and update the store.
} = {}): Promise<Result<IOnChainTransactionData>> => {
	try {
		if (!selectedNetwork) {
			selectedNetwork = getSelectedNetwork();
		}
		if (!selectedWallet) {
			selectedWallet = getSelectedWallet();
		}
		if (!addressType) {
			addressType = getSelectedAddressType({ selectedWallet, selectedNetwork });
		}

		const { currentWallet } = getCurrentWallet({
			selectedWallet,
			selectedNetwork,
		});

		const currentChangeAddresses =
			currentWallet.changeAddresses[selectedNetwork];

		const inputs = currentWallet.utxos[selectedNetwork];
		const outputs = currentWallet.transaction[selectedNetwork].outputs || [];
		const addressTypes = getAddressTypes();
		let changeAddresses: IAddress = {};
		await Promise.all(
			Object.keys(addressTypes).map((key) => {
				changeAddresses = {
					...changeAddresses,
					...currentChangeAddresses[key],
				};
			}),
		);
		const changeAddressesArr = Object.values(changeAddresses).map(
			({ address }) => address,
		);
		const changeAddress =
			currentWallet.changeAddressIndex[selectedNetwork][addressType].address;
		const fee = getTotalFee({
			satsPerByte: 1,
			message: '',
		});
		//Remove any potential change address that may have been included from a previous tx attempt.
		const newOutputs = outputs.filter((output) => {
			if (output?.address && !changeAddressesArr.includes(output?.address)) {
				return output;
			}
		});

		const payload = {
			selectedNetwork,
			selectedWallet,
			inputs,
			changeAddress,
			fee,
			outputs: newOutputs,
			rbf,
		};

		if (submitDispatch) {
			dispatch({
				type: actions.SETUP_ON_CHAIN_TRANSACTION,
				payload,
			});
		}
		return ok(payload);
	} catch (e) {
		return err(e);
	}
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

export const updateSelectedFeeId = async ({
	feeId = EFeeIds.none,
	selectedWallet,
	selectedNetwork,
}: {
	feeId?: EFeeIds;
	selectedWallet?: string;
	selectedNetwork?: TAvailableNetworks;
}): Promise<void> => {
	try {
		if (!selectedNetwork) {
			selectedNetwork = getSelectedNetwork();
		}
		if (!selectedWallet) {
			selectedWallet = getSelectedWallet();
		}
		const transactionResponse = getOnchainTransactionData({
			selectedWallet,
			selectedNetwork,
		});
		if (transactionResponse.isErr()) {
			return;
		}
		const transaction = transactionResponse.value;
		transaction.selectedFeeId = feeId;
		return await updateOnChainTransaction({ transaction });
	} catch {}
};

export const resetOnChainTransaction = ({
	selectedWallet,
	selectedNetwork,
}: {
	selectedWallet?: string;
	selectedNetwork?: TAvailableNetworks;
} = {}): void => {
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

export const updateSelectedAddressType = ({
	addressType = EWallet.addressType,
	selectedWallet = undefined,
	selectedNetwork = undefined,
}: {
	addressType?: TAddressType;
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
			addressType,
			selectedNetwork,
			selectedWallet,
		};
		dispatch({
			type: actions.UPDATE_SELECTED_ADDRESS_TYPE,
			payload,
		});
	} catch {}
};

/**
 * Removes the specified input from the current transaction.
 * @param {IUtxo} input
 * @param {string} [selectedWallet]
 * @param {TAvailableNetworks} [selectedNetwork]
 */
export const removeTxInput = ({
	input,
	selectedWallet,
	selectedNetwork,
}: {
	input: IUtxo;
	selectedWallet?: string;
	selectedNetwork?: TAvailableNetworks;
}): Result<IUtxo[]> => {
	try {
		if (!selectedWallet) {
			selectedWallet = getSelectedWallet();
		}
		if (!selectedNetwork) {
			selectedNetwork = getSelectedNetwork();
		}
		const txData = getOnchainTransactionData({
			selectedNetwork,
			selectedWallet,
		});
		if (txData.isErr()) {
			return err(txData.error.message);
		}
		const txInputs = txData.value?.inputs ?? [];
		const newInputs = txInputs.filter((txInput) => {
			if (!objectsMatch(input, txInput)) {
				return txInput;
			}
		});
		updateOnChainTransaction({
			selectedNetwork,
			selectedWallet,
			transaction: {
				inputs: newInputs,
			},
		});
		return ok(newInputs);
	} catch (e) {
		console.log(e);
		return err(e);
	}
};

/**
 * Adds a specified input to the current transaction.
 * @param {IUtxo} input
 * @param {string} [selectedWallet]
 * @param {TAvailableNetworks} [selectedNetwork]
 */
export const addTxInput = ({
	input,
	selectedWallet,
	selectedNetwork,
}: {
	input: IUtxo;
	selectedWallet?: string;
	selectedNetwork?: TAvailableNetworks;
}): Result<IUtxo[]> => {
	try {
		if (!selectedWallet) {
			selectedWallet = getSelectedWallet();
		}
		if (!selectedNetwork) {
			selectedNetwork = getSelectedNetwork();
		}
		const txData = getOnchainTransactionData({
			selectedNetwork,
			selectedWallet,
		});
		if (txData.isErr()) {
			return err(txData.error.message);
		}
		const inputs = txData.value?.inputs ?? [];
		const newInputs = [...inputs, input];
		updateOnChainTransaction({
			selectedNetwork,
			selectedWallet,
			transaction: {
				inputs: newInputs,
			},
		});
		return ok(newInputs);
	} catch (e) {
		console.log(e);
		return err(e);
	}
};
