import { lnrpc } from 'react-native-lightning/dist/rpc';
import { TCurrentLndState } from 'react-native-lightning/src/lightning/types';

export interface ILightning {
	syncProgress: number;
	state: TCurrentLndState;
	info: lnrpc.GetInfoResponse;
}
