import { TAssetNetwork } from './wallet';

export type TViewController =
	| 'send'
	| 'receive'
	| 'sendAssetPicker'
	| 'receiveAssetPicker'
	| 'coinSelection'
	| 'feePicker'
	| 'SendNavigation'
	| 'numberPad'
	| 'test1';

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
	initial?: string;
}

export interface IUser {
	loading: boolean;
	error: boolean;
	isHydrated: boolean;
	isOnline: boolean;
	viewController: TUserViewController;
	[key: string]: any;
}
