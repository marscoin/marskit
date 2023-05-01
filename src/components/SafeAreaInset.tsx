import React, { ReactElement } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import useKeyboard from '../hooks/keyboard';

const SafeAreaInset = ({
	type,
	minPadding = 0,
}: {
	type: 'top' | 'bottom';
	minPadding?: number;
}): ReactElement => {
	const insets = useSafeAreaInsets();
	const { keyboardShown } = useKeyboard();
	const padding = Math.max(insets[type], minPadding);

	// if the keyboard is shown, we don't need to account for SafeArea at the bottom
	if (keyboardShown && type === 'bottom') {
		return <View style={{ paddingBottom: minPadding }} />;
	}

	return <View style={{ paddingTop: padding }} />;
};

export default SafeAreaInset;
