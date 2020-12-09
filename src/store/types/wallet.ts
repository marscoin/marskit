import { AvailableNetworks } from "../../utils/networks";

export interface IWallet {
    loading: boolean;
    error: boolean;
    selectedNetwork: AvailableNetworks;
    selectedWallet: string;
    wallets: { [key: string]: IDefaultWalletShape } | {};
    [key: string]: any;
}

export type AddressType = "bech32" | "segwit" | "legacy"; //"84" | "49" | "44";

export type KeyDerivationPath = "84" | "49" | "44"; //"bech32" | "segwit" | "legacy";

export type NetworkTypePath = "0" | "1" //"mainnet" | "testnet"

export interface IWalletItem<T> {
    bitcoin: T,
    bitcoinTestnet: T,
    timestamp?: number | null
}

export interface IAddress {
    [key: string]: {
        path: string,
        address: string,
        scriptHash: string
    }
}

export interface IAddresses {
    bitcoin: IAddress[] | [],
    bitcoinTestnet: IAddress[] | [],
    timestamp: null
}

export interface ICreateWallet {
    wallet: string,
    mnemonic?: string,
    selectedNetwork?: AvailableNetworks,
    addressAmount?: number,
    changeAddressAmount?: number,
    keyDerivationPath?: KeyDerivationPath,
}

export interface IDefaultWalletShape {
    id: string,
    name: string,
    type: string,
    addresses: IAddresses[] | IWalletItem<[]>,
    addressIndex: IWalletItem<number>,
    changeAddresses: IAddresses[] | IWalletItem<[]>,
    changeAddressIndex: IWalletItem<number>,
    utxos: IWalletItem<[]>,
    transactions: IWalletItem<[]>,
    blacklistedUtxos: IWalletItem<[]>,
    confirmedBalance: IWalletItem<number>,
    unconfirmedBalance: IWalletItem<number>,
    lastUpdated: IWalletItem<number>,
    hasBackedUpWallet: boolean,
    walletBackupTimestamp: string,
    keyDerivationPath: IWalletItem<KeyDerivationPath>,
    networkTypePath: IWalletItem<string>,
    addressType: {
        bitcoin: AddressType,
        bitcoinTestnet: AddressType
    },
    rbfData: IWalletItem<object>
}
