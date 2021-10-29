import { IViewControllerData } from '../types/user';

export const defaultViewController: IViewControllerData = {
	isOpen: false,
	id: '',
	asset: '',
	assetNetwork: undefined,
	assetName: undefined,
	snapPoint: 2,
};

export const defaultUserShape = {
	loading: false,
	error: false,
	isHydrated: false,
	isOnline: true,
	// Used to control various views throughout the app. (Modals, bottom-sheets, etc.)
	viewController: {
		send: { ...defaultViewController },
		receive: { ...defaultViewController },
		sendAssetPicker: { ...defaultViewController },
		receiveAssetPicker: { ...defaultViewController },
	},
};
