import { ILightning } from '../types/lightning';

export const defaultLightningShape: ILightning = {
	state: '',
	nodeId: '',
	info: {},
	channels: [],
	invoices: [],
	payments: [],
};
