import { lnrpc } from 'react-native-lightning/dist/rpc';
import { TCurrentLndState } from 'react-native-lightning/src/lightning/types';
import { ENetworks as LndNetworks } from 'react-native-lightning/dist/types';

export interface ILightning {
	syncProgress: number;
	state: TCurrentLndState;
	info: lnrpc.GetInfoResponse;
	onChainBalance: lnrpc.WalletBalanceResponse; //TODO remove this once our on-chain wallet is able to fund channel opening
	channelBalance: lnrpc.ChannelBalanceResponse;
	invoiceList: lnrpc.ListInvoiceResponse;
}

export interface ICreateLightningWallet {
	mnemonic: string;
	password: string;
	network: LndNetworks;
}

export interface IUnlockLightningWallet {
	password: string;
	network: LndNetworks;
}
