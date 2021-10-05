export const defaultUserShape = {
	loading: false,
	error: false,
	isHydrated: false,
	isOnline: true,
	// Used to control various views throughout the app. (Modals, bottom-sheets, etc.)
	viewController: {
		send: {
			id: '',
			isOpen: false,
			snapPoint: 2,
		},
		receive: {
			id: '',
			isOpen: false,
			snapPoint: 2,
		},
	},
};
