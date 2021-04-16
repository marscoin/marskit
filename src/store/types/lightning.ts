import {
	lnrpc,
	TCurrentLndState,
	ENetworks as LndNetworks,
} from 'react-native-lightning';

export interface ILightning {
	syncProgress: number;
	state: TCurrentLndState;
	info: lnrpc.GetInfoResponse;
	onChainBalance: lnrpc.WalletBalanceResponse; //TODO remove this once our on-chain wallet is able to fund channel opening
	channelBalance: lnrpc.ChannelBalanceResponse;
	invoiceList: lnrpc.ListInvoiceResponse;
	paymentList: lnrpc.ListPaymentsResponse;
	cachedNeutrinoDBDownloadState: ICachedNeutrinoDBDownloadState;
}

export interface ICachedNeutrinoDBDownloadState {
	task?: undefined | 'downloading' | 'unzipping' | 'complete' | 'failed';
	downloadProgress?: number;
	unzipProgress?: number;
}

export interface ICreateLightningWallet {
	network: LndNetworks;
}

export interface IUnlockLightningWallet {
	network: LndNetworks;
}
