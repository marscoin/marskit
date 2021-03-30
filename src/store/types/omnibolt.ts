import { IConnect, ILogin } from 'omnibolt-js/lib/types/types';
import { IWalletItem } from './wallet';
import { ICheckpoint, IMyChannels } from '../shapes/omnibolt';

export interface IOmniBolt {
	wallets: {
		[key: string]: IOmniBoltWallet;
	};
}

export interface IOmniBoltWallet {
	userData: IWalletItem<IOmniBoltUserData>;
	connectData: IWalletItem<IOmniboltConnectData>;
	channels: IWalletItem<IChannelData>;
	tempChannels: IWalletItem<IMyChannels>;
	peers: IWalletItem<string[]>;
	checkpoints: IWalletItem<ICheckpoint>;
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

export interface IChannelContent {
	invoiceCheckpoint: string;
	last_temp_address: IAddressIndex;
	rsmc_temp_address: IAddressIndex;
	htlc_temp_address: IAddressIndex;
	htlc_temp_address_for_he1b: IAddressIndex;
}

export interface IChannelData {
	[key: string]: IChannelContent;
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

export type TOmniboltCheckpoints =
	| 'channelAccept'
	| 'onChannelAccept'
	| 'fundBitcoin'
	| 'onFundBitcoin'
	| 'htlcFindPath'
	| 'onHtlcFindPath'
	| 'addHtlc'
	| 'onAddHtlc'
	| 'htlcSIgned'
	| 'onHtlcSigned'
	| 'forwardR'
	| 'onForwardR'
	| 'signR'
	| 'onSignR'
	| 'closeHtlc'
	| 'onCloseHtlc'
	| 'closeHtlcSigned'
	| 'onCloseHtlcSigned';
