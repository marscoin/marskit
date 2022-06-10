import { TAssetNetwork } from './wallet';
import { IActivityItem } from './activity';

export type TViewController =
	| 'send'
	| 'sendAssetPicker'
	| 'coinSelection'
	| 'feePicker'
	| 'sendNavigation'
	| 'receiveNavigation'
	| 'numberPad'
	| 'numberPadFee'
	| 'backupPrompt'
	| 'backupNavigation'
	| 'PINPrompt'
	| 'PINNavigation'
	| 'boostPrompt'
	| 'activityTagsPrompt';

export type TUserViewController = {
	[key in TViewController]: IViewControllerData;
};

export interface IViewControllerData {
	isOpen?: boolean;
	id?: string;
	asset?: string;
	assetNetwork?: TAssetNetwork;
	assetName?: string;
	snapPoint?: number;
	initial?: string;
	activityItem?: IActivityItem;
}

export interface IUser {
	loading: boolean;
	error: boolean;
	isHydrated: boolean;
	isOnline: boolean;
	viewController: TUserViewController;
	[key: string]: any;
}
