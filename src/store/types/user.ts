import { TAssetNetwork } from './wallet';

export type TViewController =
	| 'send'
	| 'receive'
	| 'sendAssetPicker'
	| 'receiveAssetPicker'
	| 'coinSelection'
	| 'feePicker'
	| 'numberPad';

export type TUserViewController = {
	[key in TViewController]: IViewControllerData;
};

export interface IUserViewController {
	send: IViewControllerData;
	receive: IViewControllerData;
}

export interface IViewControllerData {
	isOpen?: boolean;
	id?: string;
	asset?: string;
	assetNetwork?: TAssetNetwork;
	assetName?: string;
	snapPoint?: number;
}

export interface IUser {
	loading: boolean;
	error: boolean;
	isHydrated: boolean;
	isOnline: boolean;
	viewController: TUserViewController;
	[key: string]: any;
}
