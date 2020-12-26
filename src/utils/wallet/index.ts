import { INetwork, TAvailableNetworks } from '../networks';
import { networks } from '../networks';
import { defaultWalletShape } from '../../store/shapes/wallet';
import {
	EWallet,
	IAddress,
	IAddressContent,
	IDefaultWalletShape,
	TAddressType,
	TKeyDerivationPath,
} from '../../store/types/wallet';
import { err, ok, Result } from '../../utils/result';
import {
	IResponse,
	IGetAddress,
	IGenerateAddresses,
	IGetInfoFromAddressPath,
	IGenerateAddressesResponse,
} from '../types';
import { getKeychainValue, isOnline } from '../helpers';
import { getStore } from '../../store/helpers';
import {
	getAddressScriptHashesHistory,
	getAddressScriptHashesMempool,
} from 'rn-electrum-client/helpers';
import { addAddresses } from '../../store/actions/wallet';

const bitcoin = require('bitcoinjs-lib');
const { CipherSeed } = require('aezeed');
const bip39 = require('bip39');
const bip32 = require('bip32');

/**
 * Generates a series of addresses based on the specified params.
 * @async
 * @param {string} wallet - Wallet ID
 * @param {number} addressAmount - Number of addresses to generate.
 * @param {number} changeAddressAmount - Number of changeAddresses to generate.
 * @param {number} addressIndex - What index to start generating addresses at.
 * @param {number} changeAddressIndex - What index to start generating changeAddresses at.
 * @param {string} selectedNetwork - What network to generate addresses for (bitcoin or bitcoinTestnet).
 * @param {string} keyDerivationPath - The path to generate addresses from.
 * @param {string} addressType - Determines what type of address to generate (legacy, segwit, bech32).
 */
export const generateAddresses = async ({
	wallet = EWallet.defaultWallet,
	addressAmount = 1,
	changeAddressAmount = 1,
	addressIndex = 0,
	changeAddressIndex = 0,
	selectedNetwork = EWallet.selectedNetwork,
	keyDerivationPath = EWallet.keyDerivationPath,
	addressType = EWallet.addressType,
}: IGenerateAddresses): Promise<Result<IGenerateAddressesResponse, string>> => {
	return new Promise(async (resolve) => {
		try {
			const networkTypePath =
				defaultWalletShape.networkTypePath[selectedNetwork];
			const network = networks[selectedNetwork];
			const getMnemonicPhraseResponse = await getMnemonicPhrase(wallet);
			if (getMnemonicPhraseResponse.error) {
				return resolve(err(getMnemonicPhraseResponse.data));
			}

			//Attempt to acquire the bip39Passphrase if available
			const bip39Passphrase = await getBip39Passphrase(wallet);

			const mnemonic = getMnemonicPhraseResponse.data;
			const seed = bip39.mnemonicToSeedSync(mnemonic, bip39Passphrase);
			const root = bip32.fromSeed(seed, network);

			//Generate Addresses
			let addresses: IAddress = {};
			let changeAddresses: IAddress = {};
			let addressArray = new Array(addressAmount).fill(null);
			let changeAddressArray = new Array(changeAddressAmount).fill(null);
			await Promise.all([
				addressArray.map(async (item, i) => {
					try {
						const index = i + addressIndex;
						const addressPath = `m/${keyDerivationPath}'/${networkTypePath}'/0'/0/${index}`;
						const addressKeypair = root.derivePath(addressPath);
						const address = await getAddress({
							keyPair: addressKeypair,
							network,
							type: addressType,
						});
						const scriptHash = getScriptHash(address, network);
						addresses[scriptHash] = {
							index,
							path: addressPath,
							address,
							scriptHash,
						};
					} catch {}
				}),
				changeAddressArray.map(async (item, i) => {
					try {
						const index = i + changeAddressIndex;
						const changeAddressPath = `m/${keyDerivationPath}'/${networkTypePath}'/0'/1/${index}`;
						const changeAddressKeypair = root.derivePath(changeAddressPath);
						const address = await getAddress({
							keyPair: changeAddressKeypair,
							network,
							type: addressType,
						});
						const scriptHash = getScriptHash(address, network);
						changeAddresses[scriptHash] = {
							index,
							path: changeAddressPath,
							address,
							scriptHash,
						};
					} catch {}
				}),
			]);

			return resolve(ok({ addresses, changeAddresses }));
		} catch (e) {
			console.log(e);
			return resolve(err(e));
		}
	});
};

/**
 * Get mnemonic phrase for a given wallet.
 * @async
 * @param {string} wallet - Wallet ID
 * @return {{error: boolean, data: string}}
 */
export const getMnemonicPhrase = async (
	wallet: string = EWallet.defaultWallet,
): Promise<IResponse<string>> => {
	try {
		//Get wallet from the store if none was provided
		if (!wallet) {
			const selectedWallet = getStore().wallet.selectedWallet;
			return await getKeychainValue({ key: selectedWallet });
		}
		return await getKeychainValue({ key: wallet });
	} catch (e) {
		return { error: true, data: e };
	}
};

/**
 *.Returns any previously stored aezeed passphrase.
 * @async
 * @return {{error: boolean, data: string}}
 */
export const getAezeedPassphrase = async (): Promise<IResponse<string>> => {
	try {
		return await getKeychainValue({
			key: 'aezeedPassphrase',
		});
	} catch (e) {
		return { error: true, data: e };
	}
};

/**
 * Generate an aezeed cipher mnemonic phrase.
 * @async
 * @param passphrase
 * @return {Promise<string>}
 */
export const generateAezeedMnemonic = async ({
	aezeedPassphrase = EWallet.aezeedPassphrase,
}: {
	aezeedPassphrase?: string;
}): Promise<string> => {
	try {
		const cipherSeedVersion = 0;
		return CipherSeed.random().toMnemonic(aezeedPassphrase, cipherSeedVersion);
	} catch (e) {
		return e;
	}
};

/**
 * Generate a mnemonic phrase.
 * @async
 * @param {number} strength
 * @return {Promise<string>}
 */
export const generateMnemonic = async (strength = 256): Promise<string> => {
	try {
		return await bip39.generateMnemonic(strength);
	} catch (e) {
		return '';
	}
};

/**
 * Get bip39 passphrase for a specified wallet.
 * @async
 * @param {string} wallet
 * @return {Promise<string>}
 */
export const getBip39Passphrase = async (wallet = ''): Promise<string> => {
	try {
		const key = `${wallet}passphrase`;
		const bip39PassphraseResult = await getKeychainValue({ key });
		if (!bip39PassphraseResult.error && bip39PassphraseResult.data) {
			return bip39PassphraseResult.data;
		}
		return '';
	} catch {
		return '';
	}
};

/**
 * Get scriptHash for a given address
 * @param {string} address
 * @param {string|Object} network
 * @return {string}
 */
export const getScriptHash = (
	address = '',
	network: INetwork | string = networks.bitcoin,
): string => {
	try {
		if (!address || !network) {
			return '';
		}
		if (typeof network === 'string' && network in networks) {
			network = networks[network];
		}
		const script = bitcoin.address.toOutputScript(address, network);
		let hash = bitcoin.crypto.sha256(script);
		const reversedHash = new Buffer(hash.reverse());
		return reversedHash.toString('hex');
	} catch {
		return '';
	}
};

/**
 * Get address for a given keyPair, network and type.
 * @param {Object|undefined} keyPair
 * @param {string|Object|undefined} network
 * @param {string} type - Determines what type of address to generate (legacy, segwit, bech32).
 * @return {string}
 */
export const getAddress = ({
	keyPair = undefined,
	network = undefined,
	type = EWallet.addressType,
}: IGetAddress): string => {
	if (!keyPair || !network) {
		return '';
	}
	try {
		switch (type) {
			case 'bech32':
				//Get Native Bech32 (bc1) addresses
				return bitcoin.payments.p2wpkh({ pubkey: keyPair.publicKey, network })
					.address;
			case 'segwit':
				//Get Segwit P2SH Address (3)
				return bitcoin.payments.p2sh({
					redeem: bitcoin.payments.p2wpkh({
						pubkey: keyPair.publicKey,
						network,
					}),
					network,
				}).address;
			//Get Legacy Address (1)
			case 'legacy':
				return bitcoin.payments.p2pkh({ pubkey: keyPair.publicKey, network })
					.address;
		}
		return '';
	} catch {
		return '';
	}
};

/**
 * Get info from an address path "m/49'/0'/0'/0/1"
 * @param {string} path - The path to derive information from.
 * @return {{error: <boolean>, isChangeAddress: <number>, addressIndex: <number>, data: <string>}}
 */
export const getInfoFromAddressPath = (path = ''): IGetInfoFromAddressPath => {
	try {
		if (path === '') {
			return { error: true, data: 'No path specified' };
		}
		let isChangeAddress = false;
		const lastIndex = path.lastIndexOf('/');
		const addressIndex = Number(path.substr(lastIndex + 1));
		const firstIndex = path.lastIndexOf('/', lastIndex - 1);
		const addressType = path.substr(firstIndex + 1, lastIndex - firstIndex - 1);
		if (Number(addressType) === 1) {
			isChangeAddress = true;
		}
		return { error: false, isChangeAddress, addressIndex };
	} catch (e) {
		console.log(e);
		return { error: true, isChangeAddress: false, addressIndex: 0, data: e };
	}
};

/**
 * Determine if a given mnemonic is valid.
 * @param {string} mnemonic - The mnemonic to validate.
 * @param password
 * @return {boolean}
 */
export const validateMnemonic = (mnemonic = '', password = ''): boolean => {
	try {
		const bip39Response = bip39.validateMnemonic(mnemonic);
		if (bip39Response) {
			return true;
		}
		return !!CipherSeed.fromMnemonic(mnemonic, password);
	} catch {
		return false;
	}
};

/**
 * Get the current Bitcoin balance in sats. (Confirmed+Unconfirmed)
 * @param {string} selectedWallet
 * @param {string} selectedNetwork
 * @return {{ error: boolean, data: number }} - Will always return balance in sats.
 */
export const getBitcoinBalance = ({
	selectedWallet = EWallet.defaultWallet,
	selectedNetwork = EWallet.selectedNetwork,
}: {
	selectedWallet: string;
	selectedNetwork: TAvailableNetworks;
}): IResponse<number> => {
	const wallet = getStore().wallet;
	try {
		const _wallet = wallet.wallets[selectedWallet];
		const balance =
			_wallet.confirmedBalance[selectedNetwork] +
			_wallet.unconfirmedBalance[selectedNetwork];
		return { error: false, data: balance };
	} catch {
		return { error: true, data: 0 };
	}
};

export const getExchangeRate = async ({
	selectedCurrency = 'USD',
	asset = 'bitcoin',
	exchangeRateService = 'bitfinex',
}: {
	selectedCurrency?: string;
	asset?: string;
	exchangeRateService?: string;
}): Promise<IResponse<number | object>> => {
	try {
		const assetTicker = getAssetTicker(asset);
		selectedCurrency = selectedCurrency.toUpperCase();
		return await exchangeRateHelpers[exchangeRateService]({
			assetTicker,
			selectedCurrency,
		});
	} catch (e) {
		return { error: true, data: e };
	}
};

/**
 *
 * @param {string} asset
 * @return {string}
 */
export const getAssetTicker = (asset = 'bitcoin'): string => {
	try {
		switch (asset) {
			case 'bitcoin':
				return 'BTC';
			case 'bitcoinTestnet':
				return 'BTC';
			default:
				return '';
		}
	} catch {
		return '';
	}
};

const exchangeRateHelpers = {
	/**
	 * Get Bitfinexs' exchange rate for specified asset/currency.
	 * @param assetTicker
	 * @param selectedCurrency
	 * @return {{ error: boolean, data: number }}
	 */
	bitfinex: async ({
		assetTicker = 'BTC',
		selectedCurrency = 'USD',
	}): Promise<IResponse<number>> => {
		try {
			const response = await fetch(
				`https://api-pub.bitfinex.com/v2/ticker/t${assetTicker}${selectedCurrency}`,
			);
			const jsonResponse = await response.json();
			const price = jsonResponse[6];
			return { error: false, data: price };
		} catch {
			return { error: true, data: 0 };
		}
	},
};

interface TTxResult {
	tx_hash: string;
	height: number;
}
interface ITxHashes extends TTxResult {
	scriptHash: string;
}
interface TTxResponse {
	data: object;
	id: number;
	jsonrpc: string;
	param: string;
	result: TTxResult[] | [] | any;
}
interface IGetNextAvailableAddressResponse {
	addressIndex: IAddressContent;
	changeAddressIndex: IAddressContent;
}
interface IGetNextAvailableAddress {
	selectedWallet?: string;
	selectedNetwork?: TAvailableNetworks | undefined;
	keyDerivationPath?: TKeyDerivationPath;
	addressType?: TAddressType;
}
export const getNextAvailableAddress = async ({
	selectedWallet = undefined,
	selectedNetwork = undefined,
	keyDerivationPath = '84',
	addressType = 'bech32',
}: IGetNextAvailableAddress): Promise<
	Result<IGetNextAvailableAddressResponse, string>
> => {
	return new Promise(async (resolve) => {
		const isConnected = await isOnline();
		if (!isConnected) {
			return resolve(err('Offline'));
		}

		try {
			const wallet = getStore().wallet;
			if (!selectedNetwork) {
				selectedNetwork = wallet.selectedNetwork;
			}
			if (!selectedWallet) {
				selectedWallet = wallet.selectedWallet;
			}
			const wallets = wallet.wallets;
			let currentWallet = wallets[selectedWallet];

			let addresses: IAddress = currentWallet.addresses[selectedNetwork];
			let changeAddresses: IAddress =
				currentWallet.changeAddresses[selectedNetwork];

			//How many addresses/changeAddresses are currently stored
			const addressCount = Object.values(addresses).length;
			const changeAddressCount = Object.values(changeAddresses).length;

			//The currently known/stored address index.
			let addressIndex = currentWallet.addressIndex[selectedNetwork];
			let changeAddressIndex =
				currentWallet.changeAddressIndex[selectedNetwork];

			/*
			 *	Create more addresses if none exist or the highest address index matches the current address count
			 */
			if (addressCount <= 0 || addressIndex.index === addressCount) {
				const newAddresses = await addAddresses({
					addressAmount: 5,
					changeAddressAmount: 0,
					addressIndex: addressIndex.index,
					changeAddressIndex: 0,
					selectedNetwork,
					wallet: selectedWallet,
					keyDerivationPath,
					addressType,
				});
				if (!newAddresses.isErr()) {
					addresses = newAddresses.value.addresses;
				}
			}

			/*
			 *	Create more change addresses if none exist or the highest change address index matches the current
			 *	change address count
			 */
			if (
				changeAddressCount <= 0 ||
				changeAddressIndex.index === changeAddressCount
			) {
				const newChangeAddresses = await addAddresses({
					addressAmount: 0,
					changeAddressAmount: 5,
					addressIndex: 0,
					changeAddressIndex: changeAddressIndex.index,
					selectedNetwork,
					wallet: selectedWallet,
					keyDerivationPath,
					addressType,
				});
				if (!newChangeAddresses.isErr()) {
					changeAddresses = newChangeAddresses.value.changeAddresses;
				}
			}

			//Store all addresses that are to be searched and used in this method.
			let allAddresses: IAddressContent[] = Object.values(addresses).slice(
				addressIndex.index,
				addressCount,
			);
			let addressesToScan = allAddresses;

			//Store all change addresses that are to be searched and used in this method.
			let allChangeAddresses: IAddressContent[] = Object.values(
				changeAddresses,
			).slice(changeAddressIndex.index, changeAddressCount);
			let changeAddressesToScan = allChangeAddresses;

			//Prep for batch request
			let combinedAddressesToScan = [
				...addressesToScan,
				...changeAddressesToScan,
			];

			let foundLastUsedAddress = false;
			let foundLastUsedChangeAddress = false;
			let addressHasBeenUsed = false;
			let changeAddressHasBeenUsed = false;

			while (!foundLastUsedAddress || !foundLastUsedChangeAddress) {
				let scriptHashesHistory = await getAddressScriptHashesHistory({
					scriptHashes: {
						key: 'scriptHash',
						data: combinedAddressesToScan,
					},
					network: selectedNetwork,
				});

				//Check if transactions are pending in the mempool.
				let scriptHashesMempool = await getAddressScriptHashesMempool({
					scriptHashes: {
						key: 'scriptHash',
						data: combinedAddressesToScan,
					},
					network: selectedNetwork,
				});

				if (scriptHashesHistory.error === true) {
					scriptHashesHistory = { error: scriptHashesHistory.error, data: [] };
				}
				if (scriptHashesMempool.error === true) {
					scriptHashesMempool = {
						error: scriptHashesMempool.error,
						data: [],
					};
				}
				if (
					scriptHashesHistory.error === true ||
					scriptHashesMempool.error === true
				) {
					return resolve(err('Unable to acquire tx history.'));
				}

				const allTransactions: TTxResponse[] = [
					...scriptHashesHistory.data,
					...scriptHashesMempool.data,
				];
				let txHashes: ITxHashes[] = [];
				txHashes = await Promise.all(
					allTransactions.map((txs) =>
						txs.result.map((tx) => ({ ...tx, scriptHash: txs.param })),
					),
				);

				const highestUsedIndex = await getHighestUsedIndexFromTxHashes({
					txHashes,
					addresses,
					changeAddresses,
					addressIndex,
					changeAddressIndex,
				});
				if (highestUsedIndex.isErr()) {
					return resolve(err(highestUsedIndex.error));
				}

				addressIndex = highestUsedIndex.value.addressIndex;
				changeAddressIndex = highestUsedIndex.value.changeAddressIndex;
				if (highestUsedIndex.value.foundAddressIndex) {
					addressHasBeenUsed = true;
				}
				if (highestUsedIndex.value.foundChangeAddressIndex) {
					changeAddressHasBeenUsed = true;
				}

				const highestStoredIndex = getHighestStoredAddressIndex({
					selectedNetwork,
					selectedWallet,
				});

				if (highestStoredIndex.isErr()) {
					return resolve(err(highestStoredIndex.error));
				}

				if (
					highestUsedIndex.value.addressIndex.index <
					highestStoredIndex.value.addressIndex.index
				) {
					foundLastUsedAddress = true;
				}

				if (
					highestUsedIndex.value.changeAddressIndex.index <
					highestStoredIndex.value.changeAddressIndex.index
				) {
					foundLastUsedChangeAddress = true;
				}

				if (foundLastUsedAddress && foundLastUsedChangeAddress) {
					//Increase index by one if the current index was found in a txHash or is greater than the previous index.
					let newAddressIndex = addressIndex.index;
					if (
						highestUsedIndex.value.addressIndex.index > addressIndex.index ||
						addressHasBeenUsed
					) {
						newAddressIndex = highestUsedIndex.value.addressIndex.index + 1;
					}

					let newChangeAddressIndex = changeAddressIndex.index;
					if (
						highestUsedIndex.value.changeAddressIndex.index >
							changeAddressIndex.index ||
						changeAddressHasBeenUsed
					) {
						newChangeAddressIndex =
							highestUsedIndex.value.changeAddressIndex.index + 1;
					}

					//Filter for and return the new index.
					const nextAvailableAddress = Object.values(allAddresses).filter(
						({ index }) => index === newAddressIndex,
					);
					const nextAvailableChangeAddress = Object.values(
						allChangeAddresses,
					).filter(({ index }) => index === newChangeAddressIndex);

					return resolve(
						ok({
							addressIndex: nextAvailableAddress[0],
							changeAddressIndex: nextAvailableChangeAddress[0],
						}),
					);
				}
				//Create receiving addresses for the next round
				if (!foundLastUsedAddress) {
					const newAddresses = await addAddresses({
						addressAmount: 5,
						changeAddressAmount: 0,
						addressIndex: highestStoredIndex.value.addressIndex.index,
						changeAddressIndex: 0,
						selectedNetwork,
						wallet: selectedWallet,
						keyDerivationPath,
						addressType,
					});
					if (!newAddresses.isErr()) {
						addresses = newAddresses.value.addresses;
					}
				}
				//Create change addresses for the next round
				if (!foundLastUsedChangeAddress) {
					const newChangeAddresses = await addAddresses({
						addressAmount: 0,
						changeAddressAmount: 5,
						addressIndex: 0,
						changeAddressIndex:
							highestStoredIndex.value.changeAddressIndex.index,
						selectedNetwork,
						wallet: selectedWallet,
						keyDerivationPath,
						addressType,
					});
					if (!newChangeAddresses.isErr()) {
						changeAddresses = newChangeAddresses.value.changeAddresses;
					}
				}

				//Store newly created addresses to scan in the next round.
				addressesToScan = Object.values(addresses);
				changeAddressesToScan = Object.values(changeAddresses);
				combinedAddressesToScan = [
					...addressesToScan,
					...changeAddressesToScan,
				];
				//Store the newly created addresses used for this method.
				allAddresses = [...allAddresses, ...addressesToScan];
				allChangeAddresses = [...allChangeAddresses, ...changeAddressesToScan];
			}
		} catch (e) {
			console.log(e);
			return resolve(err(e));
		}
	});
};

interface IIndexes {
	addressIndex: IAddressContent;
	changeAddressIndex: IAddressContent;
	foundAddressIndex: boolean;
	foundChangeAddressIndex: boolean;
}
export const getHighestUsedIndexFromTxHashes = async ({
	txHashes = [],
	addresses = {},
	changeAddresses = {},
	addressIndex,
	changeAddressIndex,
}: {
	txHashes: ITxHashes[];
	addresses: IAddress | {};
	changeAddresses: IAddress | {};
	addressIndex: IAddressContent;
	changeAddressIndex: IAddressContent;
}): Promise<Result<IIndexes, string>> => {
	try {
		let foundAddressIndex = false;
		let foundChangeAddressIndex = false;
		txHashes = txHashes.flat();
		await Promise.all(
			txHashes.map(({ scriptHash }) => {
				if (
					scriptHash in addresses &&
					addresses[scriptHash].index >= addressIndex.index
				) {
					foundAddressIndex = true;
					addressIndex = addresses[scriptHash];
				} else if (
					scriptHash in changeAddresses &&
					changeAddresses[scriptHash].index >= changeAddressIndex.index
				) {
					foundChangeAddressIndex = true;
					changeAddressIndex = changeAddresses[scriptHash];
				}
			}),
		);
		const data = {
			addressIndex,
			changeAddressIndex,
			foundAddressIndex,
			foundChangeAddressIndex,
		};
		return ok(data);
	} catch (e) {
		return err(e);
	}
};

/**
 * Returns the highest address and change address index stored in the app for the specified wallet and network.
 */
export const getHighestStoredAddressIndex = ({
	selectedWallet = EWallet.defaultWallet,
	selectedNetwork = EWallet.selectedNetwork,
}: {
	selectedWallet: string;
	selectedNetwork: TAvailableNetworks;
}): Result<
	{
		addressIndex: IAddressContent;
		changeAddressIndex: IAddressContent;
	},
	string
> => {
	try {
		const wallet = getStore().wallet;
		const addresses: IAddress =
			wallet.wallets[selectedWallet].addresses[selectedNetwork];
		const changeAddresses: IAddress =
			wallet.wallets[selectedWallet].changeAddresses[selectedNetwork];

		const addressIndex = Object.values(addresses).reduce((prev, current) =>
			prev.index > current.index ? prev : current,
		);

		const changeAddressIndex = Object.values(
			changeAddresses,
		).reduce((prev, current) => (prev.index > current.index ? prev : current));

		return ok({ addressIndex, changeAddressIndex });
	} catch (e) {
		return err(e);
	}
};

export const getCurrentWallet = (): {
	currentWallet: IDefaultWalletShape;
	selectedNetwork: TAvailableNetworks;
	selectedWallet: string;
} => {
	const wallet = getStore().wallet;
	const { selectedWallet, selectedNetwork } = wallet;
	const wallets = wallet.wallets;
	return {
		currentWallet: wallets[selectedWallet],
		selectedNetwork,
		selectedWallet,
	};
};
