import { lnrpc } from 'react-native-lightning/dist/rpc';
import { TCurrentLndState } from 'react-native-lightning/src/lightning/types';

export interface ILightning {
	syncProgress: number;
	state: TCurrentLndState;
	info: lnrpc.GetInfoResponse;
	onChainBalance: lnrpc.WalletBalanceResponse; //TODO remove this once our on-chain wallet is able to fund channel opening
	channelBalance: lnrpc.ChannelBalanceResponse;
}
