import { ILightning } from '../types/lightning';
import { lnrpc } from 'react-native-lightning';

export const defaultLightningShape: ILightning = {
	syncProgress: 0,
	info: lnrpc.GetInfoResponse.create(),
	state: { grpcReady: false, walletUnlocked: false, lndRunning: false },
	onChainBalance: lnrpc.WalletBalanceResponse.create(),
	channelBalance: lnrpc.ChannelBalanceResponse.create(),
	invoiceList: lnrpc.ListInvoiceResponse.create(),
	paymentList: lnrpc.ListPaymentsResponse.create(),
	cachedNeutrinoDBDownloadState: {
		task: undefined,
		downloadProgress: 0,
		unzipProgress: 0,
	},
};
