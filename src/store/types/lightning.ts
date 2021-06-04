import {
	lnrpc,
	TCurrentLndState,
	ENetworks as LndNetworks,
	ICachedNeutrinoDBDownloadState,
} from '@synonymdev/react-native-lightning';

export interface ILightning {
	syncProgress: number;
	state: TCurrentLndState;
	info: lnrpc.GetInfoResponse;
	channelBalance: lnrpc.ChannelBalanceResponse;
	invoiceList: lnrpc.ListInvoiceResponse;
	paymentList: lnrpc.ListPaymentsResponse;
	cachedNeutrinoDBDownloadState: ICachedNeutrinoDBDownloadState;
}

export interface ICreateLightningWallet {
	network: LndNetworks;
}

export interface IUnlockLightningWallet {
	network: LndNetworks;
}
