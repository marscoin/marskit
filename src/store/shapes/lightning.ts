import { ILightning } from '../types/lightning';
import { lnrpc, ss_lnrpc } from '@synonymdev/react-native-lightning';

export const defaultLightningShape: ILightning = {
	syncProgress: 0,
	info: lnrpc.GetInfoResponse.create(),
	state: ss_lnrpc.WalletState.WAITING_TO_START,
	channelBalance: lnrpc.ChannelBalanceResponse.create(),
	invoiceList: lnrpc.ListInvoiceResponse.create(),
	paymentList: lnrpc.ListPaymentsResponse.create(),
	cachedNeutrinoDBDownloadState: {
		task: undefined,
		downloadProgress: 0,
		unzipProgress: 0,
	},
};
