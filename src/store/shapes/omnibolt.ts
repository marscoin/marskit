import {
	EOmniBoltConnectData,
	EOmniBoltUserData,
	IChannelData,
	IOmniBolt,
	IOmniBoltWallet,
	TOmniboltCheckpoints,
} from '../types/omnibolt';
import { arrayTypeItems } from './wallet';
import { IWalletItem } from '../types/wallet';
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
	[key: string]: TOmniboltCheckpoints; //key === channelId;
}
const checkpoints: IWalletItem<ICheckpoint> = {
	bitcoin: {},
	bitcoinTestnet: {},
};

export interface IMyChannelsData extends IGetMyChannelsData {
	initiator: boolean;
}

export interface IMyChannels {
	[key: string]: IMyChannelsData;
}

export const channels: IWalletItem<IChannelData> = {
	bitcoin: {},
	bitcoinTestnet: {},
};

export const tempChannels: IWalletItem<IMyChannels> = {
	bitcoin: {},
	bitcoinTestnet: {},
};

export const defaultOmniboltWalletShape: IOmniBoltWallet = {
	userData,
	connectData,
	channels,
	tempChannels,
	peers: arrayTypeItems,
	addresses: arrayTypeItems,
	checkpoints,
};

export const defaultOmniBoltShape: IOmniBolt = {
	wallets: {
		wallet0: defaultOmniboltWalletShape,
	},
};
