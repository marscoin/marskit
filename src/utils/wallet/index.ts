import { INetwork, TAvailableNetworks } from '../networks';
import { networks } from '../networks';
import { defaultWalletShape } from '../../store/shapes/wallet';
import {
	EWallet,
	IAddress,
	IAddressContent,
	IDefaultWalletShape,
	IFormattedTransaction,
	IUtxo,
	IWalletItem,
	TAddressType,
	TKeyDerivationPath,
} from '../../store/types/wallet';
import { err, ok, Result } from '../result';
import {
	IResponse,
	IGetAddress,
	IGenerateAddresses,
	IGetInfoFromAddressPath,
	IGenerateAddressesResponse,
} from '../types';
import { getKeychainValue, isOnline } from '../helpers';
import { getStore } from '../../store/helpers';
import * as electrum from 'rn-electrum-client/helpers';
import {
	addAddresses,
	updateAddressIndexes,
	updateExchangeRate,
	updateTransactions,
	updateUtxos,
} from '../../store/actions/wallet';
import {
	showErrorNotification,
	showSuccessNotification,
} from '../notifications';
import { ICustomElectrumPeer } from '../../store/types/settings';
import { updateOnChainActivityList } from '../../store/actions/activity';

const bitcoin = require('bitcoinjs-lib');
const { CipherSeed } = require('aezeed');
const bip39 = require('bip39');
const bip32 = require('bip32');

export const refreshWallet = async (): Promise<Result<string>> => {
	try {
		const { selectedWallet, selectedNetwork } = getCurrentWallet({});
		await updateAddressIndexes({ selectedWallet, selectedNetwork });
		await Promise.all([
			subscribeToHeader({ selectedNetwork }),
			subscribeToAddresses({
				selectedWallet,
				selectedNetwork,
			}),
			updateExchangeRate(),
			updateUtxos({
				selectedWallet,
				selectedNetwork,
			}),
			updateTransactions({
				selectedWallet,
				selectedNetwork,
			}),
		]);

		return ok('');
	} catch (e) {
		return err(e);
	} finally {
		//Keep the activity store up to date
		await updateOnChainActivityList();
	}
};

interface ISubscribeToAddress {
	data: {
		id: number;
		jsonrpc: string;
		result: null;
	};
	error: boolean;
	id: number;
	method: string;
}
export const subscribeToAddresses = async ({
	addressScriptHash = '',
	changeAddressScriptHash = '',
	selectedNetwork = undefined,
	selectedWallet = undefined,
}: {
	selectedNetwork?: undefined | TAvailableNetworks;
	selectedWallet?: undefined | string;
	addressScriptHash?: string;
	changeAddressScriptHash?: string;
}): Promise<Result<string>> => {
	if (!selectedNetwork) {
		selectedNetwork = getSelectedNetwork();
	}
	if (!selectedWallet) {
		selectedWallet = getSelectedWallet();
	}
	const { currentWallet } = getCurrentWallet({
		selectedNetwork,
		selectedWallet,
	});
	if (!addressScriptHash) {
		addressScriptHash = currentWallet.addressIndex[selectedNetwork].scriptHash;
	}
	if (!changeAddressScriptHash) {
		changeAddressScriptHash =
			currentWallet.changeAddressIndex[selectedNetwork].scriptHash;
	}
	const subscribeAddressResponse: ISubscribeToAddress = await electrum.subscribeAddress(
		{
			scriptHash: addressScriptHash,
			network: selectedNetwork,
			onReceive: (data): void => {
				showSuccessNotification({
					title: 'Received BTC',
					message: data[1], //TODO: Include amount received as the message.
				});
				refreshWallet();
			},
		},
	);
	const subscribeChangeAddressResponse: ISubscribeToAddress = await electrum.subscribeAddress(
		{
			scriptHash: changeAddressScriptHash,
			network: selectedNetwork,
			onReceive: refreshWallet,
		},
	);
	if (subscribeAddressResponse.error) {
		return err('Unable to subscribe to receiving addresses.');
	}
	if (subscribeChangeAddressResponse.error) {
		return err('Unable to subscribe to change addresses.');
	}
	return ok('Successfully subscribed to addresses.');
};

interface ISubscribeToHeader {
	data: {
		height: number;
		hex: string;
	};
	error: boolean;
	id: string;
	method: string;
}
export const subscribeToHeader = async ({
	selectedNetwork = undefined,
}: {
	selectedNetwork?: undefined | TAvailableNetworks;
}): Promise<Result<string>> => {
	if (!selectedNetwork) {
		selectedNetwork = getSelectedNetwork();
	}
	const subscribeResponse: ISubscribeToHeader = await electrum.subscribeHeader({
		network: selectedNetwork,
		onReceive: refreshWallet,
	});
	if (subscribeResponse.error) {
		return err('Unable to subscribe to headers.');
	}
	return ok('Successfully subscribed to headers.');
};

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
}: IGenerateAddresses): Promise<Result<IGenerateAddressesResponse>> => {
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
	data: IAddressContent;
	id: number;
	jsonrpc: string;
	param: string;
	result: TTxResult[];
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
	Result<IGetNextAvailableAddressResponse>
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
			if (!addressIndex?.address) {
				const generatedAddresses = await generateAddresses({
					wallet: selectedWallet,
					selectedNetwork,
					addressAmount: 1,
					changeAddressAmount: 0,
					keyDerivationPath,
				});
				if (generatedAddresses.isErr()) {
					return resolve(err(generatedAddresses.error));
				}
				const key = Object.keys(generatedAddresses.value.addresses)[0];
				addressIndex = generatedAddresses.value.addresses[key];
			}

			if (!changeAddressIndex?.address) {
				const generatedChangeAddresses = await generateAddresses({
					wallet: selectedWallet,
					selectedNetwork,
					addressAmount: 0,
					changeAddressAmount: 1,
					keyDerivationPath,
				});
				if (generatedChangeAddresses.isErr()) {
					return resolve(err(generatedChangeAddresses.error));
				}
				const key = Object.keys(generatedChangeAddresses.value.addresses)[0];
				addressIndex = generatedChangeAddresses.value.addresses[key];
			}

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
				//Check if transactions are pending in the mempool.
				const addressHistory = await getAddressHistory({
					scriptHashes: combinedAddressesToScan,
					selectedNetwork,
					selectedWallet,
				});

				if (addressHistory.isErr()) {
					return resolve(err('Unable to acquire tx history.'));
				}

				const txHashes: IGetAddressHistoryResponse[] = addressHistory.value;

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
}): Promise<Result<IIndexes>> => {
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
}): Result<{
	addressIndex: IAddressContent;
	changeAddressIndex: IAddressContent;
}> => {
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

export const getSelectedNetwork = (): TAvailableNetworks => {
	return getStore().wallet.selectedNetwork;
};

export const getSelectedWallet = (): string => {
	return getStore().wallet.selectedWallet;
};

export const getCurrentWallet = ({
	selectedNetwork = undefined,
	selectedWallet = undefined,
}: {
	selectedNetwork?: undefined | TAvailableNetworks;
	selectedWallet?: string;
}): {
	currentWallet: IDefaultWalletShape;
	selectedNetwork?: TAvailableNetworks;
	selectedWallet?: string | undefined;
} => {
	const wallet = getStore().wallet;
	if (!selectedNetwork) {
		selectedNetwork = wallet.selectedNetwork;
	}
	if (!selectedWallet) {
		selectedWallet = wallet.selectedWallet;
	}
	const wallets = wallet.wallets;
	return {
		currentWallet: wallets[selectedWallet],
		selectedNetwork,
		selectedWallet,
	};
};

/**
 * Returns utxos for a given wallet and network along with the available balance.
 */
export const getUtxos = async ({
	selectedWallet = undefined,
	selectedNetwork = undefined,
}: {
	selectedWallet: undefined | string;
	selectedNetwork: undefined | TAvailableNetworks;
}): Promise<Result<{ utxos: IUtxo[]; balance: number }>> => {
	try {
		if (!selectedNetwork) {
			selectedNetwork = getSelectedNetwork();
		}
		if (!selectedWallet) {
			selectedWallet = getSelectedWallet();
		}
		const { currentWallet } = getCurrentWallet({
			selectedNetwork,
			selectedWallet,
		});
		const unspentAddressResult = await electrum.listUnspentAddressScriptHashes({
			scriptHashes: {
				key: 'scriptHash',
				data: {
					...currentWallet.addresses[selectedNetwork],
					...currentWallet.changeAddresses[selectedNetwork],
				},
			},
			network: selectedNetwork,
		});
		if (unspentAddressResult.error) {
			return err(unspentAddressResult.data);
		}
		let utxos: IUtxo[] = [];
		let balance = 0;
		await Promise.all(
			unspentAddressResult.data.map(({ data, result }) => {
				if (result.length > 0) {
					return result.map((unspentAddress: IUtxo) => {
						balance = balance + unspentAddress.value;
						utxos.push({
							...data,
							...unspentAddress,
						});
					});
				}
			}),
		);
		return ok({ utxos, balance });
	} catch (e) {
		return err(e);
	}
};

export interface ITransaction<T> {
	id: number;
	jsonrpc: string;
	param: string;
	data: T;
	result: {
		blockhash: string;
		blocktime: number;
		confirmations: number;
		hash: string;
		hex: string;
		locktime: number;
		size: number;
		time: number;
		txid: string;
		version: number;
		vin: {
			scriptSig: {
				asm: string;
				hex: string;
			};
			sequence: number;
			txid: string;
			txinwitness: string[];
			vout: number;
		}[];
		vout: {
			n: 0;
			scriptPubKey: {
				addresses: string[];
				asm: string;
				hex: string;
				reqSigs: number;
				type: string;
			};
			value: number;
		}[];
		vsize: number;
		weight: number;
	};
}

interface IGetTransactions {
	error: boolean;
	id: number;
	method: string;
	network: string;
	data: ITransaction<IUtxo>[];
}
interface ITxHash {
	tx_hash: string;
}
export const getTransactions = async ({
	txHashes = [],
	selectedNetwork = EWallet.selectedNetwork,
}: {
	txHashes: ITxHash[];
	selectedNetwork: TAvailableNetworks;
}): Promise<Result<IGetTransactions>> => {
	try {
		if (txHashes.length < 1) {
			return ok({
				error: false,
				id: 0,
				method: 'getTransactions',
				network: selectedNetwork,
				data: [],
			});
		}
		const data = {
			key: 'tx_hash',
			data: txHashes,
		};
		const response = await electrum.getTransactions({
			txHashes: data,
			network: selectedNetwork,
		});
		if (response.error) {
			return err(response);
		}
		return ok(response);
	} catch (e) {
		return err(e);
	}
};

interface IGetTransactionsFromInputs {
	error: boolean;
	id: number;
	method: string;
	network: string;
	data: ITransaction<{
		tx_hash: string;
		vout: number;
	}>[];
}
export const getTransactionsFromInputs = async ({
	txHashes = [],
	selectedNetwork = undefined,
}: {
	txHashes: ITxHash[];
	selectedNetwork: undefined | TAvailableNetworks;
}): Promise<Result<IGetTransactionsFromInputs>> => {
	try {
		const data = {
			key: 'tx_hash',
			data: txHashes,
		};
		const response = await electrum.getTransactions({
			txHashes: data,
			network: selectedNetwork,
		});
		if (!response.error) {
			return ok(response);
		} else {
			return err(response);
		}
	} catch (e) {
		return err(e);
	}
};

export const getInputData = async ({
	selectedNetwork = undefined,
	inputs = [],
}: {
	inputs: { tx_hash: string; vout: number }[];
	selectedNetwork?: undefined | TAvailableNetworks;
}): Promise<Result<{ [key: string]: { addresses: []; value: number } }>> => {
	try {
		if (!selectedNetwork) {
			selectedNetwork = getSelectedNetwork();
		}
		const getTransactionsResponse = await getTransactionsFromInputs({
			txHashes: inputs,
			selectedNetwork,
		});
		const inputData = {};
		if (getTransactionsResponse.isErr()) {
			return err(getTransactionsResponse.error.message);
		}
		getTransactionsResponse.value.data.map(({ data, result }) => {
			const vout = result.vout[data.vout];
			const addresses = vout.scriptPubKey.addresses;
			const value = vout.value;
			const key = data.tx_hash;
			inputData[key] = { addresses, value };
		});
		return ok(inputData);
	} catch (e) {
		return err(e);
	}
};

export const formatTransactions = async ({
	selectedNetwork = undefined,
	selectedWallet = EWallet.defaultWallet,
	transactions = [],
}: {
	selectedNetwork: undefined | TAvailableNetworks;
	selectedWallet: string;
	transactions: ITransaction<IUtxo>[];
}): Promise<Result<IFormattedTransaction>> => {
	if (transactions.length < 1) {
		return ok({});
	}
	if (!selectedNetwork) {
		selectedNetwork = getSelectedNetwork();
	}
	if (!selectedWallet) {
		selectedWallet = getSelectedWallet();
	}
	const { currentWallet } = getCurrentWallet({
		selectedNetwork,
		selectedWallet,
	});

	// Batch and pre-fetch input data.
	let inputs: { tx_hash: string; vout: number }[] = [];
	transactions.map(({ result: { vin } }) => {
		vin.map(({ txid, vout }) => {
			inputs.push({ tx_hash: txid, vout });
		});
	});
	const inputDataResponse = await getInputData({
		selectedNetwork,
		inputs,
	});
	if (inputDataResponse.isErr()) {
		return err(inputDataResponse.error.message);
	}
	const inputData = inputDataResponse.value;

	const addresses = currentWallet.addresses[selectedNetwork];
	const changeAddresses = currentWallet.changeAddresses[selectedNetwork];
	const addressScriptHashes = Object.keys(addresses);
	const changeAddressScriptHashes = Object.keys(changeAddresses);
	const [addressArray, changeAddressArray] = await Promise.all([
		addressScriptHashes.map((key) => {
			return addresses[key].address;
		}),
		changeAddressScriptHashes.map((key) => {
			return changeAddresses[key].address;
		}),
	]);

	let formattedTransactions: IFormattedTransaction = {};

	transactions.map(({ data, result }) => {
		let totalInputValue = 0; // Total value of all inputs.
		let matchedInputValue = 0; // Total value of all inputs with addresses that belong to this wallet.
		let totalOutputValue = 0; // Total value of all outputs.
		let matchedOutputValue = 0; // Total value of all outputs with addresses that belong to this wallet.
		let messages: string[] = []; // Array of OP_RETURN messages.

		//Iterate over each input
		const vin = result.vin;
		vin.map(({ txid, scriptSig }) => {
			//Push any OP_RETURN messages to messages array
			try {
				const asm = scriptSig.asm;
				if (asm !== '' && asm.includes('OP_RETURN')) {
					const OpReturnMessages = decodeOpReturnMessage(asm);
					messages = messages.concat(OpReturnMessages);
				}
			} catch {}

			const { addresses: _addresses, value } = inputData[txid];
			totalInputValue = totalInputValue + value;
			_addresses.map((address) => {
				if (
					addressArray.includes(address) ||
					changeAddressArray.includes(address)
				) {
					matchedInputValue = matchedInputValue + value;
				}
			});
		});

		//Iterate over each output
		const vout = result.vout;
		vout.map(({ scriptPubKey, value }) => {
			const _addresses = scriptPubKey.addresses;
			totalOutputValue = totalOutputValue + value;
			_addresses.map((address) => {
				if (
					addressArray.includes(address) ||
					changeAddressArray.includes(address)
				) {
					matchedOutputValue = matchedOutputValue + value;
				}
			});
		});

		const txid = result.txid;
		const type = matchedInputValue > matchedOutputValue ? 'sent' : 'received';
		const totalMatchedValue = matchedOutputValue - matchedInputValue;
		const value = Number(totalMatchedValue.toFixed(8));
		const totalValue = totalInputValue - totalOutputValue;
		const fee = Number(Math.abs(totalValue).toFixed(8));
		const { address, height, scriptHash } = data;
		let timestamp = Date.now();

		if (height > 0 && result?.blocktime) {
			timestamp = result.blocktime * 1000;
		}

		formattedTransactions[txid] = {
			address,
			height,
			scriptHash,
			totalInputValue,
			matchedInputValue,
			totalOutputValue,
			matchedOutputValue,
			fee,
			type,
			value,
			txid,
			messages,
			timestamp,
		};
	});
	return ok(formattedTransactions);
};

//Returns an array of messages from an OP_RETURN message
export const decodeOpReturnMessage = (opReturn = ''): string[] => {
	let messages: string[] = [];
	try {
		//Remove OP_RETURN from the string & trim the string.
		if (opReturn.includes('OP_RETURN')) {
			opReturn = opReturn.replace('OP_RETURN', '');
			opReturn = opReturn.trim();
		}

		const regex = /[0-9A-Fa-f]{6}/g;
		//Separate the string into an array based upon a space and insert each message into an array to be returned
		const data = opReturn.split(' ');
		data.forEach((msg) => {
			try {
				//Ensure the message is in fact a hex
				if (regex.test(msg)) {
					const message = new Buffer(msg, 'hex').toString();
					messages.push(message);
				}
			} catch {}
		});
		return messages;
	} catch (e) {
		console.log(e);
		return messages;
	}
};

interface IGetAddressScriptHashesHistoryResponse {
	data: TTxResponse[];
	error: boolean;
	id: number;
	method: string;
	network: string;
}

export interface IGetAddressHistoryResponse
	extends TTxResult,
		IAddressContent {}
export const getAddressHistory = async ({
	scriptHashes = undefined,
	selectedNetwork = EWallet.selectedNetwork,
	selectedWallet = EWallet.defaultWallet,
}: {
	scriptHashes?: undefined | IAddressContent[];
	selectedNetwork?: TAvailableNetworks;
	selectedWallet?: string;
}): Promise<Result<IGetAddressHistoryResponse[]>> => {
	try {
		if (!scriptHashes) {
			const { currentWallet } = getCurrentWallet({
				selectedNetwork,
				selectedWallet,
			});
			const addresses = currentWallet.addresses[selectedNetwork];
			const changeAddresses = currentWallet.changeAddresses[selectedNetwork];
			const addressValues = Object.values(addresses);
			const changeAddressValues = Object.values(changeAddresses);
			scriptHashes = [...addressValues, ...changeAddressValues];
		}
		const payload = {
			key: 'scriptHash',
			data: scriptHashes,
		};
		const response: IGetAddressScriptHashesHistoryResponse = await electrum.getAddressScriptHashesHistory(
			{
				scriptHashes: payload,
				network: selectedNetwork,
			},
		);

		const mempoolResponse: IGetAddressScriptHashesHistoryResponse = await electrum.getAddressScriptHashesMempool(
			{
				scriptHashes: payload,
				network: selectedNetwork,
			},
		);

		if (response.error || mempoolResponse.error) {
			return err('Unable to get address history.');
		}

		const combinedResponse = [...response.data, ...mempoolResponse.data];

		let history: IGetAddressHistoryResponse[] = [];
		combinedResponse.map(
			({
				data,
				result,
			}: {
				data: IAddressContent;
				result: TTxResult[];
			}): void => {
				if (result.length > 0) {
					result.map((item) => {
						history.push({ ...data, ...item });
					});
				}
			},
		);

		return ok(history);
	} catch (e) {
		return err(e);
	}
};

export const getCustomElectrumPeers = ({
	selectedNetwork = undefined,
}: {
	selectedNetwork: undefined | TAvailableNetworks;
}): ICustomElectrumPeer[] | [] => {
	try {
		if (!selectedNetwork) {
			selectedNetwork = getSelectedNetwork();
		}
		const settings = getStore().settings;
		return settings.customElectrumPeers[selectedNetwork] || [];
	} catch {
		return [];
	}
};

const tempElectrumServers: IWalletItem<ICustomElectrumPeer[]> = {
	bitcoin: [{ host: 'bitcoin.lukechilds.co', port: 50002 }],
	bitcoinTestnet: [
		{
			host: 'testnet.aranguren.org',
			port: 51002,
		},
	],
};
export const connectToElectrum = async ({
	selectedNetwork = undefined,
	retryAttempts = 2,
}: {
	selectedNetwork?: TAvailableNetworks | undefined;
	retryAttempts?: number;
}): Promise<Result<string>> => {
	if (!selectedNetwork) {
		selectedNetwork = getSelectedNetwork();
	}

	//Attempt to disconnect from any old/lingering connections
	await electrum.stop({ network: selectedNetwork });

	// Fetch any stored custom peers.
	let customPeers = getCustomElectrumPeers({ selectedNetwork });
	if (customPeers.length < 1) {
		customPeers = tempElectrumServers[selectedNetwork];
	}

	let i = 0;
	let startResponse = { error: true, data: '' };
	while (i < retryAttempts) {
		startResponse = await electrum.start({
			network: selectedNetwork,
			customPeers,
		});
		if (!startResponse.error) {
			break;
		}
		i++;
	}

	if (startResponse.error) {
		//Attempt one more time
		const { error, data } = await electrum.start({
			network: selectedNetwork,
			customPeers,
		});
		if (error) {
			showErrorNotification({
				title: 'Unable to connect to Electrum Server.',
				message: data,
			});
			return err(data);
		}
	}
	return ok('Successfully connected.');
};
