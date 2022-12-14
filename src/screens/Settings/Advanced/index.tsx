import React, { memo, ReactElement, useMemo } from 'react';
import { useSelector } from 'react-redux';

import { IListData, ItemData } from '../../../components/List';
import SettingsView from '../SettingsView';
import type { SettingsScreenProps } from '../../../navigation/types';
import {
	addressTypeSelector,
	selectedNetworkSelector,
} from '../../../store/reselect/wallet';
import { enableDevOptionsSelector } from '../../../store/reselect/settings';

const typesDescriptions = {
	p2wpkh: 'Native Segwit',
	p2sh: 'Segwit',
	p2pkh: 'Legacy',
};

const networkLabels = {
	bitcoin: 'Mainnet',
	bitcoinTestnet: 'Testnet',
	bitcoinRegtest: 'Regtest',
};

const AdvancedSettings = ({
	navigation,
}: SettingsScreenProps<'AdvancedSettings'>): ReactElement => {
	const selectedNetwork = useSelector(selectedNetworkSelector);

	const selectedAddressType = useSelector(addressTypeSelector);

	const enableDevOptions = useSelector(enableDevOptionsSelector);

	const SettingsListData: IListData[] = useMemo(() => {
		const payments: ItemData[] = [
			{
				title: 'Bitcoin Address Type',
				type: 'button',
				value: typesDescriptions[selectedAddressType],
				onPress: (): void => navigation.navigate('AddressTypePreference'),
			},
			{
				title: 'Coin Selection',
				type: 'button',
				onPress: (): void => navigation.navigate('CoinSelectPreference'),
			},
			{
				title: 'Payment Preference',
				type: 'button',
				onPress: (): void => navigation.navigate('PaymentPreference'),
			},
			{
				title: 'Blocktank Orders',
				type: 'button',
				onPress: (): void => navigation.navigate('BlocktankOrders'),
			},
		];

		const networks: ItemData[] = [
			{
				title: 'Lightning Connections',
				type: 'button',
				onPress: (): void => navigation.navigate('Channels'),
			},
			{
				title: 'Lightning Node',
				type: 'button',
				onPress: (): void => navigation.navigate('LightningNodeInfo'),
			},
			{
				title: 'Electrum Server',
				type: 'button',
				onPress: (): void => navigation.navigate('ElectrumConfig'),
			},
		];

		if (enableDevOptions) {
			networks.push({
				title: 'Bitcoin Network',
				value: networkLabels[selectedNetwork],
				type: 'button',
				onPress: (): void => navigation.navigate('BitcoinNetworkSelection'),
			});
		}

		return [
			{
				title: 'Payments',
				data: payments,
			},
			{
				title: 'Networks',
				data: networks,
			},
		];
	}, [navigation, selectedAddressType, selectedNetwork, enableDevOptions]);

	return (
		<SettingsView
			title="Advanced"
			listData={SettingsListData}
			showBackNavigation={true}
		/>
	);
};

export default memo(AdvancedSettings);
