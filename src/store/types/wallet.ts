import { TAvailableNetworks } from '../../utils/networks';

export type TAddressType = 'bech32' | 'segwit' | 'legacy'; //"84" | "49" | "44";
export type TKeyDerivationAccountType = 'onchain' | 'rgb' | 'omnibolt';
export type TKeyDerivationPurpose = '84' | '49' | '44'; //"bech32" | "segwit" | "legacy";
export type TKeyDerivationCoinType = '0' | '1'; //"mainnet" | "testnet";
export type TKeyDerivationAccount = '0' | '2' | '3'; //"On-Chain Wallet" | "RGB" | "Omnibolt";
export type TKeyDerivationChange = '0' | '1'; //"Receiving Address" | "Change Address";
export type TKeyDerivationAddressIndex = string;

export type NetworkTypePath = '0' | '1'; //"mainnet" | "testnet"

export type TBitcoinUnit = 'satoshi' | 'BTC' | 'mBTC' | 'μBTC';

export type TBitcoinAbbreviation = 'sats' | 'BTC';

export type TBitcoinLabel = 'Bitcoin' | 'Bitcoin Testnet';

export type TTicker = 'BTC' | 'tBTC';

export type TTransactionType = 'sent' | 'received';

export type TGetByteCountInput =
	| 'MULTISIG-P2SH'
	| 'MULTISIG-P2WSH'
	| 'MULTISIG-P2SH-P2WSH'
	| 'P2PKH'
	| 'P2WPKH'
	| 'P2SH-P2WPKH'
	| 'bech32'
	| 'segwit'
	| 'legacy'
	| any; //Unsure how to account for multisig variations (ex. 'MULTISIG-P2SH:2-4')

export type TGetByteCountOutput =
	| 'P2SH'
	| 'P2PKH'
	| 'P2WPKH'
	| 'P2WSH'
	| 'bech32'
	| 'segwit'
	| 'legacy';

export type TGetByteCountInputs = {
	[key in TGetByteCountInput]?: number;
};

export type TGetByteCountOutputs = {
	[key in TGetByteCountOutput]?: number;
};

export enum EWallet {
	selectedNetwork = 'bitcoin',
	defaultWallet = 'wallet0',
	aezeedPassphrase = 'shhhhhhhh123',
	addressType = 'bech32',
}

export enum EOutput {
	address = '',
	value = 0,
	index = 0,
}

export enum EKeyDerivationAccount {
	onchain = 0,
	rgb = 2,
	omnibolt = 3,
}

// m / purpose' / coin_type' / account' / change / address_index
export interface IKeyDerivationPath {
	purpose: TKeyDerivationPurpose;
	coinType: TKeyDerivationCoinType;
	account: TKeyDerivationAccount;
	change: TKeyDerivationChange;
	addressIndex: TKeyDerivationAddressIndex;
}

export interface IWallet {
	loading: boolean;
	walletExists: boolean;
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
	publicKey: string;
}

export interface IAddress {
	[key: string]: IAddressContent;
}

export interface ICreateWallet {
	walletName?: string;
	mnemonic?: string;
	addressAmount?: number;
	changeAddressAmount?: number;
	keyDerivationPath?: IKeyDerivationPath;
	addressType?: TAddressType;
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

export interface IOutput {
	address?: string; //Address to send to.
	value?: number; //Amount denominated in sats.
	index?: number;
}

export interface IFormattedTransactionContent {
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
}
export interface IFormattedTransaction {
	[key: string]: IFormattedTransactionContent;
}

export interface IOnChainTransactionData {
	outputs?: IOutput[];
	utxos?: IUtxo[];
	changeAddress?: string;
	fiatAmount?: number;
	fee?: number; //Total fee in sats
	satsPerByte?: number;
	recommendedFee?: number; //Total recommended fee in sats
	transactionSize?: number; //In bytes (250 is about normal)
	message?: string; // OP_RETURN data for a given transaction.
	label?: string; // User set label for a given transaction.
}

export const defaultOnChainTransactionData: IOnChainTransactionData = {
	outputs: [EOutput],
	utxos: [],
	changeAddress: '',
	fiatAmount: 0,
	fee: 250,
	satsPerByte: 1,
	recommendedFee: 1,
	transactionSize: 250,
	message: '',
	label: '',
};

export interface IDefaultWalletShape {
	id: string;
	name: string;
	type: string;
	addresses: IWalletItem<IAddress> | IWalletItem<{}>;
	addressIndex: IWalletItem<IAddressContent>;
	changeAddresses: IWalletItem<IAddress> | IWalletItem<{}>;
	changeAddressIndex: IWalletItem<IAddressContent>;
	utxos: IWalletItem<IUtxo[]>;
	transactions: IWalletItem<IFormattedTransaction> | IWalletItem<{}>;
	blacklistedUtxos: IWalletItem<[]>;
	balance: IWalletItem<number>;
	lastUpdated: IWalletItem<number>;
	hasBackedUpWallet: boolean;
	walletBackupTimestamp: string;
	keyDerivationPath: IWalletItem<IKeyDerivationPath>;
	networkTypePath: IWalletItem<string>;
	addressType: {
		bitcoin: TAddressType;
		bitcoinTestnet: TAddressType;
	};
	rbfData: IWalletItem<object>;
	transaction: IWalletItem<IOnChainTransactionData>;
}

export interface IDefaultWallet {
	[key: string]: IDefaultWalletShape;
}
