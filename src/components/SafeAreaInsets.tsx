import React, { PropsWithChildren, ReactElement } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { View } from '../styles/components';

interface Props extends PropsWithChildren<any> {
	type: 'top' | 'bottom';
	maxPaddingTop?: number;
	maxPaddingBottom?: number;
}

const SafeAreaInsets = ({
	type,
	maxPaddingTop,
	maxPaddingBottom,
}: Props): ReactElement => {
	const insets = useSafeAreaInsets();

	let paddingTop = 0;
	let paddingBottom = 0;

	if (type === 'top') {
		paddingTop = Math.max(insets.top, maxPaddingTop || 0);
	}

	if (type === 'bottom') {
		paddingBottom = Math.max(insets.bottom, maxPaddingBottom || 0);
	}

	return (
		<View
			color={'transparent'}
			style={{
				paddingTop,
				paddingBottom,
			}}
		/>
	);
};

export default SafeAreaInsets;
