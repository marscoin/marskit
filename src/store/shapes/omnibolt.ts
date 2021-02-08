import {
	EOmniBoltConnectData,
	EOmniBoltUserData,
	IOmniBolt,
	IOmniBoltWallet,
} from '../types/omnibolt';
import { arrayTypeItems, objectTypeItems } from './wallet';

const connectData = {
	bitcoin: EOmniBoltConnectData,
	bitcoinTestnet: EOmniBoltConnectData,
};

const userData = {
	bitcoin: EOmniBoltUserData,
	bitcoinTestnet: EOmniBoltUserData,
};

export const defaultOmniboltWalletShape: IOmniBoltWallet = {
	userData,
	connectData,
	channels: objectTypeItems,
	peers: arrayTypeItems,
};

export const defaultOmniBoltShape: IOmniBolt = {
	wallets: {
		wallet0: defaultOmniboltWalletShape,
	},
};
