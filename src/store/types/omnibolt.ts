import {
	IAcceptChannel,
	IBitcoinFundingCreated,
	ICheckpoints,
	IConnect,
	IFundingBitcoin,
	IGetProperty,
	ILogin,
	IOnBitcoinFundingCreated,
	IOnChannelOpenAttempt,
	ISendSignedHex100341,
} from 'omnibolt-js/lib/types/types';
import { IAddressContent, IWalletItem } from './wallet';
import { IMyChannels } from '../shapes/omnibolt';

export interface IOmniBolt {
	wallets: {
		[key: string]: IOmniBoltWallet;
	};
	assetData: {
		[key: string]: IGetProperty;
	};
}

export type TFundingAddresses = {
	[key: string]: IAddressContent;
};

export interface IOmniBoltWallet {
	userData: IWalletItem<IOmniBoltUserData>;
	connectData: IWalletItem<IOmniboltConnectData>;
	channels: IWalletItem<IMyChannels>;
	tempChannels: IWalletItem<IMyChannels>;
	peers: IWalletItem<string[]>;
	checkpoints: IWalletItem<ICheckpoints>;
	addressIndex: IWalletItem<IAddressContent>; //The next available address index for signing.
	signingData: IWalletItem<IChannelSigningData> | IWalletItem<{}>; //A key-value index of the most recently used signing address per channel.
	fundingAddresses: IWalletItem<TFundingAddresses> | IWalletItem<{}>;
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

export type TSigningDataKey = keyof ISigningData;

export interface ISigningData {
	fundingAddress: IAddressContent;
	addressIndex: IAddressContent;
	last_temp_address: IAddressContent;
	rsmc_temp_address: IAddressContent;
	htlc_temp_address: IAddressContent;
	htlc_temp_address_for_he1b: IAddressContent;
	kTbSignedHex: string;
	funding_txid: string;
	kTempPrivKey: string;
	kTbSignedHexCR110351: string;
	kTbSignedHexRR110351: string;
}

export interface IChannelSigningData {
	[key: string]: ISigningData;
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
	| 'onChannelOpenAttempt'
	| 'channelAccept'
	| 'onAcceptChannel'
	| 'fundBitcoin'
	| 'onFundBitcoin'
	| 'onBitcoinFundingCreated'
	| 'onAssetFundingCreated'
	| 'sendSignedHex101035'
	| 'onCommitmentTransactionCreated'
	| 'commitmentTransactionAccepted'
	| 'on110353'
	| 'on110352'
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
	| 'onCloseHtlcSigned'
	| 'onChannelCloseAttempt'
	| 'sendSignedHex100363';

export type TOmniboltCheckpontData =
	| IOnBitcoinFundingCreated
	| IAcceptChannel
	| IOnChannelOpenAttempt
	| IFundingBitcoin
	| IBitcoinFundingCreated
	| ISendSignedHex100341;

export interface IUpdateOmniboltChannelSigningData {
	channelId: string;
	signingDataKey: string;
	signingData: IAddressContent | string;
}
