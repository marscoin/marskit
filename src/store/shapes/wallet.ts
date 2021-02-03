import {
	IWalletItem,
	IDefaultWalletShape,
	EWallet,
	IWallet,
	EOnChainTransactionData,
	IAddressContent,
	IOnChainTransactionData,
} from '../types/wallet';

export const onChainTransaction: IWalletItem<IOnChainTransactionData> = {
	bitcoin: EOnChainTransactionData,
	bitcoinTestnet: EOnChainTransactionData,
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

export const addressIndex: IWalletItem<IAddressContent> = {
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
	transaction: onChainTransaction,
};

export const defaultWalletStoreShape: IWallet = {
	loading: false,
	error: false,
	selectedNetwork: 'bitcoinTestnet',
	selectedWallet: EWallet.defaultWallet,
	exchangeRate: 0,
	wallets: {
		wallet0: defaultWalletShape,
	},
};
