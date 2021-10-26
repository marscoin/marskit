import React, { memo, ReactElement, useCallback, useMemo } from 'react';

import { IListData } from '../../../../components/List';
import SettingsView from '../../SettingsView';
import { useSelector } from 'react-redux';
import Store from '../../../../store/types';

const Seeds = (): ReactElement => {
	const SeedTypeData: IListData[] = [
		{
			data: [
				{
					title: 'Bitcoin',
					type: 'button',
					onPress: (): void => {},
					hide: false,
				},
				{
					title: 'Lightning',
					type: 'button',
					onPress: (): void => {},
					hide: false,
				},
				{
					title: 'OmniBOLT',
					type: 'button',
					onPress: (): void => {},
					hide: false,
				},
				{
					title: 'Slashtags',
					type: 'button',
					onPress: (): void => {},
					hide: false,
				},
			],
		},
	];

	return (
		<SettingsView title={'Seeds'} data={SeedTypeData} showBackNavigation />
	);
};

export default memo(Seeds);
