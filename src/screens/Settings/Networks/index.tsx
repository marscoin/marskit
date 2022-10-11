import React, { memo, ReactElement, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { IListData } from '../../../components/List';
import Store from '../../../store/types';
import SettingsView from '../SettingsView';

const networkLabels = {
	bitcoin: 'Mainnet',
	bitcoinTestnet: 'Testnet',
	bitcoinRegtest: 'Regtest',
};

const NetworksSettings = ({ navigation }): ReactElement => {
	const selectedNetwork = useSelector(
		(state: Store) => state.wallet.selectedNetwork,
	);

	const SettingsListData: IListData[] = useMemo(
		() => [
			{
				data: [
					{
						title: 'Bitcoin Network',
						value: networkLabels[selectedNetwork],
						type: 'button',
						onPress: (): void => navigation.navigate('BitcoinNetworkSelection'),
						hide: false,
					},
					{
						title: 'Lightning Node Info',
						type: 'button',
						onPress: (): void => navigation.navigate('LightningNodeInfo'),
						hide: false,
					},
					{
						title: 'Lightning connections',
						type: 'button',
						onPress: (): void => navigation.navigate('Channels'),
						hide: false,
					},
					{
						title: 'Electrum Server',
						type: 'button',
						onPress: (): void => navigation.navigate('ElectrumConfig'),
						hide: false,
					},
				],
			},
		],
		[navigation, selectedNetwork],
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
