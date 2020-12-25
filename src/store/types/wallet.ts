import { TAvailableNetworks } from '../../utils/networks';

export type TAddressType = 'bech32' | 'segwit' | 'legacy'; //"84" | "49" | "44";

export type TKeyDerivationPath = '84' | '49' | '44'; //"bech32" | "segwit" | "legacy";

export type NetworkTypePath = '0' | '1'; //"mainnet" | "testnet"

export type TBitcoinUnit = 'satoshi' | 'BTC' | 'mBTC' | 'μBTC';

export type TBitcoinAbbreviation = 'sats' | 'BTC';

export type TBitcoinLabel = 'Bitcoin' | 'Bitcoin Testnet';

export type TTicker = 'BTC' | 'tBTC';

export enum EWallet {
	selectedNetwork = 'bitcoin',
	defaultWallet = 'wallet0',
	aezeedPassphrase = 'shhhhhhhh123',
	keyDerivationPath = '84',
	addressType = 'bech32',
}

export interface IWallet {
	loading: boolean;
	error: boolean;
	selectedNetwork: TAvailableNetworks;
	selectedWallet: string;
	exchangeRate: number;
	wallets: { [key: string]: IDefaultWalletShape } | {};
	[key: string]: any;
}

export interface IWalletItem<T> {
	bitcoin: T;
	bitcoinTestnet: T;
	timestamp?: number | null;
}

export interface IAddressContent {
	index: number;
	path: string;
	address: string;
	scriptHash: string;
}

export interface IAddress {
	[key: string]: IAddressContent;
}

export interface IAddresses {
	bitcoin: IAddressContent;
	bitcoinTestnet: IAddressContent;
	timestamp: null;
}

export interface ICreateWallet {
	wallet?: string;
	mnemonic?: string;
	addressAmount?: number;
	changeAddressAmount?: number;
	keyDerivationPath?: TKeyDerivationPath;
}

export interface IDefaultWalletShape {
	id: string;
	name: string;
	type: string;
	addresses: IAddresses | IWalletItem<object>;
	addressIndex: IAddresses;
	changeAddresses: IAddresses | IWalletItem<object>;
	changeAddressIndex: IAddresses;
	utxos: IWalletItem<[]>;
	transactions: IWalletItem<[]>;
	blacklistedUtxos: IWalletItem<[]>;
	confirmedBalance: IWalletItem<number>;
	unconfirmedBalance: IWalletItem<number>;
	lastUpdated: IWalletItem<number>;
	hasBackedUpWallet: boolean;
	walletBackupTimestamp: string;
	keyDerivationPath: IWalletItem<TKeyDerivationPath>;
	networkTypePath: IWalletItem<string>;
	addressType: {
		bitcoin: TAddressType;
		bitcoinTestnet: TAddressType;
	};
	rbfData: IWalletItem<object>;
}
