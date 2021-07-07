import {
	lnrpc,
	ss_lnrpc,
	ICachedNeutrinoDBDownloadState,
} from '@synonymdev/react-native-lightning';

export interface ILightning {
	syncProgress: number;
	state: ss_lnrpc.WalletState;
	info: lnrpc.GetInfoResponse;
	channelBalance: lnrpc.ChannelBalanceResponse;
	invoiceList: lnrpc.ListInvoiceResponse;
	paymentList: lnrpc.ListPaymentsResponse;
	cachedNeutrinoDBDownloadState: ICachedNeutrinoDBDownloadState;
}
