import Toast, { ToastPosition } from 'react-native-toast-message';

type AppNotification = {
	title?: string;
	message: string;
};

const defaultOptions = {
	autoHide: true,
	visibilityTime: 4000,
	topOffset: 40,
	bottomOffset: 120,
};

export const showErrorNotification = (
	{ title = 'Something went wrong', message }: AppNotification,
	position: ToastPosition = 'top',
): void => {
	Toast.show({
		type: 'error',
		text1: title,
		text2: message,
		...defaultOptions,
		position,
	});
};

export const showSuccessNotification = (
	{ title = 'Success!', message }: AppNotification,
	position: ToastPosition = 'top',
): void => {
	Toast.show({
		type: 'success',
		text1: title,
		text2: message,
		...defaultOptions,
		position,
	});
};

export const showInfoNotification = (
	{ title = '', message }: AppNotification,
	position: ToastPosition = 'top',
): void => {
	Toast.show({
		type: 'info',
		text1: title,
		text2: message,
		...defaultOptions,
		position,
	});
};
