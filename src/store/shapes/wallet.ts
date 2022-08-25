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
import { IHeader } from '../../utils/types/electrum';

export const assetNetworks: TAssetNetwork[] = ['bitcoin', 'lightning'];

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
	bitcoinRegtest: defaultOnChainTransactionData,
};

export const numberTypeItems: IWalletItem<number> = {
	bitcoin: 0,
	bitcoinTestnet: 0,
	bitcoinRegtest: 0,
	timestamp: null,
};

export const arrayTypeItems: IWalletItem<[]> = {
	bitcoin: [],
	bitcoinTestnet: [],
	bitcoinRegtest: [],
	timestamp: null,
};

export const objectTypeItems: IWalletItem<object> = {
	bitcoin: {},
	bitcoinTestnet: {},
	bitcoinRegtest: {},
	timestamp: null,
};

export const stringTypeItems: IWalletItem<string> = {
	bitcoin: '',
	bitcoinTestnet: '',
	bitcoinRegtest: '',
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
	bitcoinRegtest: getAddressTypeContent({ ...addressContent }),
	timestamp: null,
};

export const changeAddressIndex: IWalletItem<
	IAddressTypeContent<IAddressContent>
> = {
	bitcoin: getAddressTypeContent(addressContent),
	bitcoinTestnet: getAddressTypeContent(addressContent),
	bitcoinRegtest: getAddressTypeContent(addressContent),
	timestamp: null,
};

export const addresses: IWalletItem<IAddressTypeContent<IAddressContent>> = {
	bitcoin: getAddressTypeContent({}),
	bitcoinTestnet: getAddressTypeContent({}),
	bitcoinRegtest: getAddressTypeContent({}),
	timestamp: null,
};

export const changeAddresses: IWalletItem<
	IAddressTypeContent<IAddressContent>
> = {
	bitcoin: getAddressTypeContent({}),
	bitcoinTestnet: getAddressTypeContent({}),
	bitcoinRegtest: getAddressTypeContent({}),
	timestamp: null,
};

export const defaultKeyDerivationPath: IKeyDerivationPath = {
	purpose: '84',
	coinType: '0',
	account: '0',
	change: '0',
	addressIndex: '0',
};

export const header: IHeader = {
	height: 0,
	hash: '',
	hex: '',
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
		bitcoinRegtest: defaultKeyDerivationPath,
	},
	networkTypePath: {
		bitcoin: '0',
		bitcoinTestnet: '1',
		bitcoinRegtest: '0',
	},
	addressType: {
		bitcoin: EWallet.addressType,
		bitcoinTestnet: EWallet.addressType,
		bitcoinRegtest: EWallet.addressType,
	},
	rbfData: objectTypeItems,
	transaction: onChainTransaction,
};

export const defaultWalletStoreShape: IWallet = {
	loading: true,
	walletExists: false,
	error: false,
	selectedNetwork: 'bitcoinRegtest',
	selectedWallet: EWallet.defaultWallet,
	addressTypes: { ...addressTypes },
	exchangeRates: {},
	header: {
		bitcoin: { ...header },
		bitcoinTestnet: { ...header },
		bitcoinRegtest: { ...header },
	},
	wallets: {},
};
