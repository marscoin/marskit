import { IViewControllerData } from '../types/user';

export const defaultViewController: IViewControllerData = {
	isOpen: false,
	id: '',
	asset: '',
	assetNetwork: undefined,
	assetName: undefined,
	snapPoint: -1,
};

export const defaultUserShape = {
	loading: false,
	error: false,
	isHydrated: false,
	isOnline: true,
	ignoreBackupTimestamp: 0,
	backupVerified: false,
	// Used to control various views throughout the app. (Modals, bottom-sheets, etc.)
	viewController: {
		send: { ...defaultViewController },
		sendAssetPicker: { ...defaultViewController },
		sendNavigation: { ...defaultViewController },
		receiveNavigation: { ...defaultViewController },
		backupPrompts: { ...defaultViewController },
		backupNavigation: { ...defaultViewController },
		PINPrompts: { ...defaultViewController },
		PINNavigation: { ...defaultViewController },
		numberPad: { ...defaultViewController },
		numberPadFee: { ...defaultViewController },
		boostPrompt: { ...defaultViewController },
		activityTagsPrompt: { ...defaultViewController },
	},
};
