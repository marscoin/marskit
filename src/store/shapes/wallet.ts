import {
	IWalletItem,
	IDefaultWalletShape,
	EWallet,
	IWallet,
	IAddressContent,
	IOnChainTransactionData,
	defaultOnChainTransactionData,
	IKeyDerivationPath,
	IAddressType,
	TAssetNetwork,
} from '../types/wallet';

export const assetNetworks: TAssetNetwork[] = [
	'bitcoin',
	'lightning',
	'omnibolt',
];

export const addressTypes: IAddressType = {
	p2pkh: {
		path: "m/44'/0'/0'/0/0",
		type: 'p2pkh',
		label: 'legacy',
	},
	p2sh: {
		path: "m/49'/0'/0'/0/0",
		type: 'p2sh',
		label: 'segwit',
	},
	p2wpkh: {
		path: "m/84'/0'/0'/0/0",
		type: 'p2wpkh',
		label: 'bech32',
	},
};

export const onChainTransaction: IWalletItem<IOnChainTransactionData> = {
	bitcoin: defaultOnChainTransactionData,
	bitcoinTestnet: defaultOnChainTransactionData,
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

export const addressContent = {
	index: 0,
	path: '',
	address: '',
	scriptHash: '',
	publicKey: '',
};

export const getAddressTypeContent = (data: any): IAddressTypeContent<any> => {
	let content = {};
	Object.keys(addressTypes).map((addressType) => {
		content[addressType] = data;
	});
	return content;
};

export type IAddressTypeContent<T> = {
	[key: string]: T;
};

export const addressIndex: IWalletItem<IAddressTypeContent<IAddressContent>> = {
	bitcoin: getAddressTypeContent({ ...addressContent }),
	bitcoinTestnet: getAddressTypeContent({ ...addressContent }),
	timestamp: null,
};

export const changeAddressIndex: IWalletItem<
	IAddressTypeContent<IAddressContent>
> = {
	bitcoin: getAddressTypeContent(addressContent),
	bitcoinTestnet: getAddressTypeContent(addressContent),
	timestamp: null,
};

export const addresses: IWalletItem<IAddressTypeContent<IAddressContent>> = {
	bitcoin: getAddressTypeContent({}),
	bitcoinTestnet: getAddressTypeContent({}),
	timestamp: null,
};

export const changeAddresses: IWalletItem<
	IAddressTypeContent<IAddressContent>
> = {
	bitcoin: getAddressTypeContent({}),
	bitcoinTestnet: getAddressTypeContent({}),
	timestamp: null,
};

export const defaultKeyDerivationPath: IKeyDerivationPath = {
	purpose: '84',
	coinType: '0',
	account: '0',
	change: '0',
	addressIndex: '0',
};

export const defaultWalletShape: IDefaultWalletShape = {
	id: '',
	name: '',
	type: 'default',
	addresses,
	addressIndex,
	changeAddresses,
	changeAddressIndex,
	utxos: arrayTypeItems,
	boostedTransactions: arrayTypeItems,
	transactions: objectTypeItems,
	blacklistedUtxos: arrayTypeItems,
	balance: numberTypeItems,
	lastUpdated: numberTypeItems,
	hasBackedUpWallet: false,
	walletBackupTimestamp: '',
	keyDerivationPath: {
		bitcoin: defaultKeyDerivationPath,
		bitcoinTestnet: {
			...defaultKeyDerivationPath,
			coinType: '0',
		},
	},
	networkTypePath: {
		bitcoin: '0',
		bitcoinTestnet: '1',
	},
	addressType: {
		bitcoin: EWallet.addressType,
		bitcoinTestnet: EWallet.addressType,
	},
	rbfData: objectTypeItems,
	transaction: onChainTransaction,
};

export const defaultWalletStoreShape: IWallet = {
	loading: true,
	walletExists: false,
	error: false,
	selectedNetwork: 'bitcoinTestnet',
	selectedWallet: EWallet.defaultWallet,
	addressTypes: { ...addressTypes },
	exchangeRates: {},
	wallets: {
		wallet0: { ...defaultWalletShape },
	},
};
