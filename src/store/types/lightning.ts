import { IWalletItem } from './wallet';
import { TChannel } from '@synonymdev/react-native-ldk';

export interface IDefaultLightningShape {
	nodeId: IWalletItem<string>;
	channels: IWalletItem<{ [key: string]: TChannel } | {}>;
	openChannelIds: IWalletItem<string[]>;
	info: IWalletItem<{}>;
	invoices: IWalletItem<[]>;
	payments: IWalletItem<[]>;
}

export interface ILightning {
	version: TLightningNodeVersion;
	nodes: {
		[key: string]: IDefaultLightningShape;
	};
}

export type TLightningNodeVersion = {
	ldk: string;
	c_bindings: string;
};

export type TUseChannelBalance = {
	spendingTotal: number; // How many sats the user has reserved in the channel. (Outbound capacity + Punishment Reserve)
	spendingAvailable: number; // How much the user is able to spend from a channel. (Outbound capacity - Punishment Reserve)
	receivingTotal: number; // How many sats the counterparty has reserved in the channel. (Inbound capacity + Punishment Reserve)
	receivingAvailable: number; // How many sats the user is able to receive in a channel. (Inbound capacity - Punishment Reserve)
	capacity: number; // Total capacity of the channel. (spendingTotal + receivingTotal)
};
