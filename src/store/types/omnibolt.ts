import { IConnect, ILogin } from 'omnibolt-js/lib/types/types';
import { IWalletItem } from './wallet';

export interface IOmniBolt {
	loading: boolean;
	error: boolean;
	selectedWallet: string;
	userData: IOmniBoltUserData;
	connectData: IOmniboltConnectData;
	channels: IWalletItem<IChannelData> | IWalletItem<{}>;
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

export enum EOmniBoltConnectData {
	nodeAddress = '',
	nodePeerId = '',
	userPeerId = '',
}

export interface IChannelData {
	invoiceCheckpoint: string;
	last_temp_address: IAddressIndex;
	rsmc_temp_address: IAddressIndex;
	htlc_temp_address: IAddressIndex;
	htlc_temp_address_for_he1b: IAddressIndex;
}

export interface IAddressIndex {
	index: number;
	address: string;
	pub_key: string;
	wif: string;
}

export interface IOmniboltConnectData {
	nodeAddress?: string;
	nodePeerId?: string;
	userPeerId?: string;
}
