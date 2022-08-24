import React, { memo, ReactElement, useMemo } from 'react';
import { useSelector } from 'react-redux';
import Store from './../../../store/types';
import { IListData } from '../../../components/List';
import SettingsView from '../SettingsView';

const typesDescriptions = {
	p2wpkh: 'Bech32',
	p2sh: 'Segwit',
	p2pkh: 'Legacy',
};

const AdvancedSettings = ({ navigation }): ReactElement => {
	const selectedAddressType = useSelector(
		(store: Store) => store.settings.addressType,
	);

	const SettingsListData: IListData[] = useMemo(
		() => [
			{
				data: [
					{
						title: 'Bitcoin address type',
						type: 'button',
						value: typesDescriptions[selectedAddressType],
						onPress: (): void => navigation.navigate('AddressTypePreference'),
						hide: false,
					},
					{
						title: 'Coin selection',
						type: 'button',
						onPress: (): void => navigation.navigate('CoinSelectPreference'),
						hide: false,
					},
					{
						title: 'Payment preference',
						type: 'button',
						onPress: (): void => {},
						hide: false,
					},
					{
						title: 'Dev settings',
						type: 'button',
						onPress: (): void => navigation.navigate('DevSettings'),
						hide: false,
					},
				],
			},
		],
		[navigation, selectedAddressType],
	);

	return (
		<SettingsView
			title={'Advanced'}
			listData={SettingsListData}
			showBackNavigation={true}
		/>
	);
};

export default memo(AdvancedSettings);
