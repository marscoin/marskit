import {
	IWalletItem,
	IDefaultWalletShape,
	IAddresses,
	EWallet,
	IWallet,
} from '../types/wallet';

export const defaultWalletStoreShape: IWallet = {
	loading: false,
	error: false,
	selectedNetwork: 'bitcoinTestnet',
	selectedWallet: EWallet.defaultWallet,
	exchangeRate: 0,
	wallets: {},
};

export const numberTypeItems: IWalletItem<number> = {
	bitcoin: 0,
	bitcoinTestnet: 0,
	timestamp: null,
};

export const arrayTypeItems: IWalletItem<[]> = {
	bitcoin: [],
	bitcoinTestnet: [],
	timestamp: null,
};

export const objectTypeItems: IWalletItem<object> = {
	bitcoin: {},
	bitcoinTestnet: {},
	timestamp: null,
};

export const addressIndex: IAddresses = {
	bitcoin: {
		index: 0,
		path: '',
		address: '',
		scriptHash: '',
	},
	bitcoinTestnet: {
		index: 0,
		path: '',
		address: '',
		scriptHash: '',
	},
	timestamp: null,
};

export const defaultWalletShape: IDefaultWalletShape = {
	id: '',
	name: '',
	type: 'default',
	addresses: arrayTypeItems,
	addressIndex: addressIndex,
	changeAddresses: arrayTypeItems,
	changeAddressIndex: addressIndex,
	utxos: arrayTypeItems,
	transactions: objectTypeItems,
	blacklistedUtxos: arrayTypeItems,
	balance: numberTypeItems,
	lastUpdated: numberTypeItems,
	hasBackedUpWallet: false,
	walletBackupTimestamp: '',
	keyDerivationPath: {
		bitcoin: '84',
		bitcoinTestnet: '84',
	},
	networkTypePath: {
		bitcoin: '0',
		bitcoinTestnet: '1',
	},
	addressType: {
		bitcoin: 'bech32',
		bitcoinTestnet: 'bech32',
	},
	rbfData: objectTypeItems,
};
