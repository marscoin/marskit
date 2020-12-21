import Toast from 'react-native-toast-message';

type AppNotification = {
	title?: string;
	message: string;
};

const topOffset = 40;

export const showErrorNotification = ({
	title = 'Something went wrong',
	message,
}: AppNotification) => {
	Toast.show({
		type: 'error',
		text1: title,
		text2: message,
		visibilityTime: 4000,
		autoHide: true,
		topOffset,
	});
};

export const showSuccessNotification = ({
	title = 'Success!',
	message,
}: AppNotification) => {
	Toast.show({
		type: 'success',
		text1: title,
		text2: message,
		visibilityTime: 4000,
		autoHide: true,
		topOffset,
	});
};

export const showInfoNotification = ({
	title = '',
	message,
}: AppNotification) => {
	Toast.show({
		type: 'info',
		text1: title,
		text2: message,
		visibilityTime: 6000,
		autoHide: true,
		topOffset,
	});
};
