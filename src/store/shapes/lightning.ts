import { IDefaultLightningShape, ILightning } from '../types/lightning';
import { arrayTypeItems, objectTypeItems, stringTypeItems } from './wallet';
import { EWallet } from '../types/wallet';

export const defaultLightningShape: IDefaultLightningShape = {
	nodeId: stringTypeItems,
	info: objectTypeItems,
	channels: objectTypeItems,
	openChannelIds: arrayTypeItems,
	invoices: arrayTypeItems,
	payments: objectTypeItems,
};

export const defaultLightningStoreShape: ILightning = {
	version: {
		ldk: '',
		c_bindings: '',
	},
	nodes: {
		[EWallet.defaultWallet]: { ...defaultLightningShape },
	},
};
