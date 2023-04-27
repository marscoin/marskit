import { useEffect, useState } from 'react';
import { Keyboard as RNKeyboard, Platform, KeyboardEvent } from 'react-native';

const useKeyboard = (): {
	keyboardShown: boolean;
	keyboardHeight: number;
} => {
	const [keyboardShown, setKeyboardShown] = useState(false);
	const [keyboardHeight, setKeyboardHeight] = useState(0);

	useEffect(() => {
		const keyboardDidShowListener = RNKeyboard.addListener(
			'keyboardDidShow',
			(event: KeyboardEvent) => {
				setKeyboardShown(true);
				setKeyboardHeight(event.endCoordinates.height);
			},
		);
		const keyboardDidHideListener = RNKeyboard.addListener(
			// ios has keyboardWillHide, android doesn't
			Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
			() => {
				setKeyboardShown(false);
				setKeyboardHeight(0);
			},
		);

		return () => {
			keyboardDidHideListener.remove();
			keyboardDidShowListener.remove();
		};
	}, []);

	return {
		keyboardShown,
		keyboardHeight,
	};
};

export const Keyboard = ((): {
	dismiss: () => Promise<void>;
} => {
	let resolve = (): void => {};
	let keyboardShown = false;

	RNKeyboard.addListener('keyboardDidHide', () => {
		keyboardShown = false;
		resolve();
	});

	RNKeyboard.addListener('keyboardDidShow', () => {
		keyboardShown = true;
	});

	// Keyboard.dismiss() that can be awaited
	const dismiss = (): Promise<void> => {
		return new Promise((p) => {
			if (keyboardShown) {
				resolve = p;
				RNKeyboard.dismiss();
			} else {
				p();
			}
		});
	};

	return {
		dismiss,
	};
})();

export default useKeyboard;
