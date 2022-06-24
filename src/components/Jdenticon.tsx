import React from 'react';
import { View, ViewStyle } from 'react-native';
import jdenticon, { JdenticonConfig } from 'jdenticon';
import { SvgXml } from 'react-native-svg';

export const Jdenticon = ({
	value,
	size = 32,
	config = {},
	style = {},
}: {
	value?: string;
	size?: number;
	config?: JdenticonConfig;
	style?: ViewStyle;
}) => {
	const _style: ViewStyle = {
		width: size,
		height: size,
		overflow: 'hidden',
		borderColor: '#333',
		borderWidth: 2,
		borderRadius: size / 2,
		...style,
	};

	if (!value) return <View style={_style} />;

	const svg = jdenticon.toSvg(value, size, config);

	return <SvgXml xml={svg} style={_style} />;
};
