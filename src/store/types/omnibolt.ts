import { IConnect, ILogin } from 'omnibolt-js/lib/types/types';

export interface IOmniBolt {
	loading: boolean;
	error: boolean;
	selectedWallet: string;
	userData: IOmniBoltUserData;
	[key: string]: any;
}

export interface IOmniBoltUserData extends IConnect, ILogin {}

export enum EOmniBoltUserData {
	recipient_node_peer_id = '',
	recipient_user_peer_id = '',
	sender_node_peer_id = '',
	sender_user_peer_id = '',
	chainNodeType = '',
	htlcFeeRate = 0,
	htlcMaxFee = 0,
	nodeAddress = '',
	nodePeerId = '',
	userPeerId = '',
}
