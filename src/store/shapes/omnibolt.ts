import {
	EOmniBoltConnectData,
	EOmniBoltUserData,
	IChannelSigningData,
	IOmniBolt,
	IOmniBoltWallet,
	ISigningData,
	TOmniboltCheckpoints,
} from '../types/omnibolt';
import { addressContent, arrayTypeItems, objectTypeItems } from './wallet';
import { IAddressContent, IWalletItem } from '../types/wallet';
import { IGetMyChannelsData } from 'omnibolt-js/lib/types/types';

const connectData = {
	bitcoin: EOmniBoltConnectData,
	bitcoinTestnet: EOmniBoltConnectData,
};

const userData = {
	bitcoin: EOmniBoltUserData,
	bitcoinTestnet: EOmniBoltUserData,
};

export interface ICheckpoint {
	//key === channelId;
	[key: string]: {
		checkpoint: TOmniboltCheckpoints;
		data: any; // Data to replay;
	};
}
const checkpoints: IWalletItem<ICheckpoint> = {
	bitcoin: {},
	bitcoinTestnet: {},
};

export const channelSigningData: ISigningData = {
	fundingAddress: { ...addressContent },
	addressIndex: { ...addressContent },
	last_temp_address: { ...addressContent },
	rsmc_temp_address: { ...addressContent },
	htlc_temp_address: { ...addressContent },
	htlc_temp_address_for_he1b: { ...addressContent },
	kTbSignedHex: '',
	funding_txid: '',
	kTempPrivKey: '',
	kTbSignedHexCR110351: '',
	kTbSignedHexRR110351: '',
};

export interface IMyChannelsData extends IGetMyChannelsData {
	funder: boolean;
}

export interface IMyChannels {
	[key: string]: IMyChannelsData;
}

export const channels: IWalletItem<IMyChannels> = {
	bitcoin: {},
	bitcoinTestnet: {},
};

export const tempChannels: IWalletItem<IMyChannels> = {
	bitcoin: {},
	bitcoinTestnet: {},
};

export const signingData: IWalletItem<IChannelSigningData> = {
	bitcoin: {},
	bitcoinTestnet: {},
};

const addressIndexTemplate: IWalletItem<IAddressContent> = {
	bitcoin: { ...addressContent },
	bitcoinTestnet: { ...addressContent },
	timestamp: null,
};

export const defaultOmniboltWalletShape: IOmniBoltWallet = {
	userData,
	connectData,
	channels,
	tempChannels,
	peers: { ...arrayTypeItems },
	addressIndex: { ...addressIndexTemplate },
	signingData,
	fundingAddresses: { ...objectTypeItems },
	checkpoints,
};

export const defaultOmniBoltShape: IOmniBolt = {
	wallets: {
		wallet0: defaultOmniboltWalletShape,
	},
	assetData: {},
};
