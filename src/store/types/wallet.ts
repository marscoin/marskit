import { TAvailableNetworks } from '../../utils/networks';

export type TAddressType = 'bech32' | 'segwit' | 'legacy'; //"84" | "49" | "44";

export type TKeyDerivationPath = '84' | '49' | '44'; //"bech32" | "segwit" | "legacy";

export type NetworkTypePath = '0' | '1'; //"mainnet" | "testnet"

export type TBitcoinUnit = 'satoshi' | 'BTC' | 'mBTC' | 'μBTC';

export type TBitcoinAbbreviation = 'sats' | 'BTC';

export type TBitcoinLabel = 'Bitcoin' | 'Bitcoin Testnet';

export type TTicker = 'BTC' | 'tBTC';

export type TTransactionType = 'sent' | 'received';

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
	timestamp?: number | null;
}

export interface ITransactions {
	bitcoin: IFormattedTransaction;
	bitcoinTestnet: IFormattedTransaction;
	timestamp?: number | null;
}

export interface ICreateWallet {
	wallet?: string;
	mnemonic?: string;
	addressAmount?: number;
	changeAddressAmount?: number;
	keyDerivationPath?: TKeyDerivationPath;
}

export interface IUtxo {
	address: string;
	index: number;
	path: string;
	scriptHash: string;
	height: number;
	tx_hash: string;
	tx_pos: number;
	value: number;
}
export interface IUtxos {
	bitcoin: IUtxo;
	bitcoinTestnet: IUtxo;
	timestamp?: number | null;
}

export interface IFormattedTransaction {
	[key: string]: {
		address: string;
		height: number;
		scriptHash: string;
		totalInputValue: number;
		matchedInputValue: number;
		totalOutputValue: number;
		matchedOutputValue: number;
		fee: number;
		type: TTransactionType;
		value: number;
		txid: string;
		messages: string[];
		timestamp: number;
	};
}

export interface IDefaultWalletShape {
	id: string;
	name: string;
	type: string;
	addresses: IAddresses | IWalletItem<{}>;
	addressIndex: IAddresses;
	changeAddresses: IAddresses | IWalletItem<{}>;
	changeAddressIndex: IAddresses;
	utxos: IUtxos | IWalletItem<[]>;
	transactions: ITransactions | IWalletItem<{}>;
	blacklistedUtxos: IWalletItem<[]>;
	balance: IWalletItem<number>;
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
