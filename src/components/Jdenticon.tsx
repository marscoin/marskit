import React from 'react';
import jdenticon, { JdenticonConfig } from 'jdenticon';
import { SvgXml } from 'react-native-svg';

export const Jdenticon = ({
	value,
	size = 32,
	config = {},
}: {
	value: string;
	size: number;
	config?: JdenticonConfig;
}): JSX.Element => {
	const svg = jdenticon.toSvg(value, size, config);
	return <SvgXml xml={svg} />;
};
