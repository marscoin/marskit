import {
	EOmniBoltConnectData,
	EOmniBoltUserData,
	IOmniBolt,
	IOmniBoltWallet,
} from '../types/omnibolt';
import { arrayTypeItems, objectTypeItems } from './wallet';
import { IWalletItem } from '../types/wallet';

const connectData = {
	bitcoin: EOmniBoltConnectData,
	bitcoinTestnet: EOmniBoltConnectData,
};

const userData = {
	bitcoin: EOmniBoltUserData,
	bitcoinTestnet: EOmniBoltUserData,
};

interface ICheckpoint {
	[key: string]: string; //key === channelId; value === checkpointId;
}
const checkpoints: IWalletItem<ICheckpoint> = {
	bitcoin: {},
	bitcoinTestnet: {},
};

export const defaultOmniboltWalletShape: IOmniBoltWallet = {
	userData,
	connectData,
	channels: objectTypeItems,
	peers: arrayTypeItems,
	addresses: arrayTypeItems,
	checkpoints,
};

export const defaultOmniBoltShape: IOmniBolt = {
	wallets: {
		wallet0: defaultOmniboltWalletShape,
	},
};
