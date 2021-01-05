import actions from './actions';
import {
	EWallet,
	ICreateWallet,
	IFormattedTransaction,
	IUtxo,
} from '../types/wallet';
import {
	formatTransactions,
	generateAddresses,
	generateMnemonic,
	getAddressHistory,
	getCurrentWallet,
	getExchangeRate,
	getMnemonicPhrase,
	getNextAvailableAddress,
	getSelectedNetwork,
	getSelectedWallet,
	getTransactions,
	getUtxos,
	ITransaction,
	validateMnemonic,
} from '../../utils/wallet';
import { getDispatch, getStore } from '../helpers';
import { setKeychainValue } from '../../utils/helpers';
import { availableNetworks, TAvailableNetworks } from '../../utils/networks';
import { defaultWalletShape } from '../shapes/wallet';
import { err, ok, Result } from '../../utils/result';
import {
	IGenerateAddresses,
	IGenerateAddressesResponse,
} from '../../utils/types';

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

export const createWallet = ({
	wallet = 'wallet0',
	addressAmount = 2,
	changeAddressAmount = 2,
	mnemonic = '',
	keyDerivationPath = '84',
}: ICreateWallet): Promise<Result<string>> => {
	return new Promise(async (resolve) => {
		try {
			const getMnemonicPhraseResponse = await getMnemonicPhrase(wallet);
			const { error, data } = getMnemonicPhraseResponse;
			const { wallets } = getStore().wallet;
			if (!error && data && wallet in wallets) {
				return resolve(err(`Wallet ID, "${wallet}" already exists.`));
			}

			//Generate Mnemonic if none was provided
			if (mnemonic === '') {
				mnemonic = validateMnemonic(data) ? data : await generateMnemonic();
			}
			if (!validateMnemonic(mnemonic)) {
				return resolve(err('Invalid Mnemonic'));
			}
			await setKeychainValue({ key: wallet, value: mnemonic });

			//Generate a set of addresses & changeAddresses for each network.
			const addressesObj = {};
			const changeAddressesObj = {};
			const addressIndex = {};
			const changeAddressIndex = {};
			const networks = availableNetworks();
			await Promise.all(
				networks.map(async (network) => {
					const generatedAddresses = await generateAddresses({
						wallet,
						selectedNetwork: network,
						addressAmount,
						changeAddressAmount,
						keyDerivationPath,
					});
					if (generatedAddresses.isErr()) {
						return resolve(err(generatedAddresses.error));
					}
					const { addresses, changeAddresses } = generatedAddresses.value;
					addressIndex[network] = Object.values(addresses)[0];
					changeAddressIndex[network] = Object.values(changeAddresses)[0];
					addressesObj[network] = addresses;
					changeAddressesObj[network] = changeAddresses;
				}),
			);
			const payload = {
				[wallet]: {
					...defaultWalletShape,
					addressIndex,
					changeAddressIndex,
					addresses: addressesObj,
					changeAddresses: changeAddressesObj,
				},
			};

			await dispatch({
				type: actions.CREATE_WALLET,
				payload,
			});

			return resolve(ok(''));
		} catch (e) {
			return resolve(err(e));
		}
	});
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

export const updateAddressIndexes = (): Promise<Result<string>> => {
	return new Promise(async (resolve) => {
		const response = await getNextAvailableAddress({});
		if (response.isErr()) {
			return resolve(err(response.error));
		}
		const { currentWallet, selectedNetwork } = getCurrentWallet({});
		if (
			response.value.addressIndex.index !==
				currentWallet.addressIndex[selectedNetwork].index ||
			response.value.changeAddressIndex.index !==
				currentWallet.changeAddressIndex[selectedNetwork].index
		) {
			await dispatch({
				type: actions.UPDATE_ADDRESS_INDEX,
				payload: {
					addressIndex: response.value.addressIndex,
					changeAddressIndex: response.value.changeAddressIndex,
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
		if (history.value.length < 1) {
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
		if (Object.keys(formattedTransactions).length < 1) {
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
