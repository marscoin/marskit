import {
	EOmniBoltConnectData,
	EOmniBoltUserData,
	IChannelAddress,
	IOmniBolt,
	IOmniBoltWallet,
	TOmniboltCheckpoints,
} from '../types/omnibolt';
import {
	addressContent,
	addressIndex,
	arrayTypeItems,
	objectTypeItems,
} from './wallet';
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

export const channelContent: IChannelAddress = {
	fundingAddress: { ...addressContent },
	addressIndex: { ...addressContent },
	last_temp_address: { ...addressContent },
	rsmc_temp_address: { ...addressContent },
	htlc_temp_address: { ...addressContent },
	htlc_temp_address_for_he1b: { ...addressContent },
};

export interface IMyChannelsData extends IGetMyChannelsData {
	initiator: boolean;
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

export const defaultOmniboltWalletShape: IOmniBoltWallet = {
	userData,
	connectData,
	channels,
	tempChannels,
	peers: { ...arrayTypeItems },
	addressIndex: { ...addressIndex },
	channelAddresses: { ...objectTypeItems },
	checkpoints,
};

export const defaultOmniBoltShape: IOmniBolt = {
	wallets: {
		wallet0: defaultOmniboltWalletShape,
	},
};
