import React, { ReactElement } from 'react';
import jdenticon, { JdenticonConfig } from 'jdenticon';
import { SvgXml } from 'react-native-svg';

const Jdenticon = ({
	value,
	size = 32,
	config,
}: {
	value: string;
	size?: number;
	config?: JdenticonConfig;
}): ReactElement => {
	const svg = jdenticon.toSvg(value, size, config);
	return <SvgXml xml={svg} />;
};

export default Jdenticon;
