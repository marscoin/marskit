import { IViewControllerData } from '../types/user';

export const defaultViewController: IViewControllerData = {
	assetNetwork: undefined,
	assetName: undefined,
	isOpen: false,
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
	},
};
