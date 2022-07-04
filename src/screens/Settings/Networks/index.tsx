import React, { memo, ReactElement, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { IListData } from '../../../components/List';
import SettingsView from '../SettingsView';
import Store from '../../../store/types';

const NetworksSettings = ({ navigation }): ReactElement => {
	const rbf = useSelector((state: Store) => state.settings?.rbf ?? true);
	const SettingsListData: IListData[] = useMemo(
		() => [
			{
				data: [
					{
						title: 'Lightning Network',
						type: 'button',
						onPress: (): void => navigation.navigate('LightningNodeInfo'),
						hide: false,
					},
					{
						title: 'Electrum Server',
						type: 'button',
						onPress: (): void => navigation.navigate('ElectrumConfig'),
						hide: false,
					},
					{
						title: 'Tor',
						type: 'switch',
						enabled: rbf,
						onPress: async (): Promise<void> => {},
						hide: false,
					},
				],
			},
		],
		[navigation, rbf],
	);

	return (
		<SettingsView
			title={'Networks'}
			listData={SettingsListData}
			showBackNavigation={true}
		/>
	);
};

export default memo(NetworksSettings);
