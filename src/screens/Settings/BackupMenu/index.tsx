import React, { memo, ReactElement, useMemo } from 'react';
import { IListData } from '../../../components/List';
import SettingsView from './../SettingsView';

const BackupMenu = ({ navigation }): ReactElement => {
	const SettingsListData: IListData[] = useMemo(
		() => [
			{
				data: [
					{
						title: 'Backup your money',
						type: 'button',
						onPress: async (): Promise<void> => {
							navigation.navigate('Seeds');
						},
						hide: false,
					},
					{
						title: 'Backup your data',
						type: 'button',
						onPress: (): void => navigation.navigate('ExportBackups'),
						enabled: true,
						hide: false,
					},
					{
						title: 'Reset and restore wallet',
						type: 'button',
						onPress: (): void => {},
						enabled: true,
						hide: false,
					},
				],
			},
		],
		[],
	);

	return (
		<SettingsView
			title={'Backup or restore'}
			listData={SettingsListData}
			showBackNavigation={true}
		/>
	);
};

export default memo(BackupMenu);
