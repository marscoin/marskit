import React, { ReactElement } from 'react';
import Animated from 'react-native-reanimated';
import {
	Platform,
	KeyboardAvoidingView as RNKeyboardAvoidingView,
	KeyboardAvoidingViewProps,
} from 'react-native';

import useKeyboard from '../hooks/keyboard';

/**
 * Custom component because on Android the height
 * of the 'AvoidingView' is not always correct
 */
const KeyboardAvoidingView = ({
	children,
	behavior = 'padding',
	...props
}: KeyboardAvoidingViewProps): ReactElement => {
	const { keyboardHeight } = useKeyboard();
	const isAndroid = Platform.OS === 'android';

	return (
		<RNKeyboardAvoidingView enabled={!isAndroid} behavior={behavior} {...props}>
			{children}
			{isAndroid && <Animated.View style={{ height: keyboardHeight }} />}
		</RNKeyboardAvoidingView>
	);
};

export default KeyboardAvoidingView;
