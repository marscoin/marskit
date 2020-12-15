import { IWalletItem, IDefaultWalletShape } from '../types/wallet';

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

export const defaultWalletShape: IDefaultWalletShape = {
	id: '',
	name: '',
	type: 'default',
	addresses: arrayTypeItems,
	addressIndex: numberTypeItems,
	changeAddresses: arrayTypeItems,
	changeAddressIndex: numberTypeItems,
	utxos: arrayTypeItems,
	transactions: arrayTypeItems,
	blacklistedUtxos: arrayTypeItems,
	confirmedBalance: numberTypeItems,
	unconfirmedBalance: numberTypeItems,
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
