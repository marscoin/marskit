import { INetwork, TAvailableNetworks } from '../networks';
import { networks } from '../networks';
import { defaultWalletShape } from '../../store/shapes/wallet';
import { EWallet, IAddress } from '../../store/types/wallet';
import {
	IResponse,
	IGetAddress,
	IGenerateAddresses,
	IGetInfoFromAddressPath,
	IGenerateAddressesResponse,
} from '../types';
import { getKeychainValue } from '../helpers';
import { getStore } from '../../store/helpers';

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
}: IGenerateAddresses): Promise<IGenerateAddressesResponse> => {
	return new Promise(async (resolve) => {
		const failure = (data) => resolve({ error: true, data });
		try {
			const networkTypePath =
				defaultWalletShape.networkTypePath[selectedNetwork];
			const network = networks[selectedNetwork];
			const getMnemonicPhraseResponse = await getMnemonicPhrase(wallet);
			if (getMnemonicPhraseResponse.error) {
				return failure(getMnemonicPhraseResponse.data);
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
						const addressPath = `m/${keyDerivationPath}'/${networkTypePath}'/0'/0/${
							i + addressIndex
						}`;
						const addressKeypair = root.derivePath(addressPath);
						const address = await getAddress({
							keyPair: addressKeypair,
							network,
							type: addressType,
						});
						const scriptHash = getScriptHash(address, network);
						addresses[scriptHash] = { address, scriptHash, path: addressPath };
					} catch {}
				}),
				changeAddressArray.map(async (item, i) => {
					try {
						const changeAddressPath = `m/${keyDerivationPath}'/${networkTypePath}'/0'/1/${
							i + changeAddressIndex
						}`;
						const changeAddressKeypair = root.derivePath(changeAddressPath);
						const address = await getAddress({
							keyPair: changeAddressKeypair,
							network,
							type: addressType,
						});
						const scriptHash = getScriptHash(address, network);
						changeAddresses[scriptHash] = {
							address,
							scriptHash,
							path: changeAddressPath,
						};
					} catch {}
				}),
			]);

			resolve({ error: false, data: { addresses, changeAddresses } });
		} catch (e) {
			console.log(e);
			failure(e);
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
