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

export interface IOnChainTransactionData {
	address?: string;
	amount?: number | Long; //In sats
	fiatAmount?: number;
	fee?: number; //In sats
	recommendedFee?: number; //In sats
	transactionSize?: number; //In bytes (250 is about normal)
	message?: string; // OP_RETURN data for a given transaction.
	label?: string; // User set label for a given transaction.
}

export enum EOnChainTransactionData {
	address = '',
	amount = 0, //Amount to send, in sats.
	fiatAmount = 0, //Amount to send, in fiat.
	fee = 1, // sats/byte.
	recommendedFee = 1, // sats/byte
	transactionSize = 250, // In bytes (250 is about normal)
	message = '', // OP_RETURN data for a given transaction.
	label = '', // User set label for a given transaction.
}

export interface IDefaultWalletShape {
	id: string;
	name: string;
	type: string;
	addresses: IWalletItem<IAddressContent> | IWalletItem<{}>;
	addressIndex: IWalletItem<IAddressContent>;
	changeAddresses: IWalletItem<IAddressContent> | IWalletItem<{}>;
	changeAddressIndex: IWalletItem<IAddressContent>;
	utxos: IWalletItem<IUtxo> | IWalletItem<[]>;
	transactions: IWalletItem<IFormattedTransaction> | IWalletItem<{}>;
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
	transaction: IWalletItem<IOnChainTransactionData>;
}
