import React, { memo, ReactElement, useMemo } from 'react';

import { IListData } from '../../../components/List';
import SettingsView from '../SettingsView';
import { useSelector } from 'react-redux';
import Store from '../../../store/types';
import { updateSettings } from '../../../store/actions/settings';
import { TBitcoinUnit } from '../../../store/types/wallet';
import { capitalize } from '../../../utils/helpers';

const BitcoinSettings = (): ReactElement => {
	const selectedBitcoinUnit = useSelector(
		(state: Store) => state.settings.bitcoinUnit,
	);

	const bitcoinUnits: TBitcoinUnit[] = ['BTC', 'satoshi'];

	const CurrencyListData: IListData[] = useMemo(
		() => [
			{
				title: 'Bitcoin display unit',
				data: bitcoinUnits.map((unit) => ({
					title: capitalize(unit),
					value: unit === selectedBitcoinUnit,
					type: 'button',
					onPress: (): any => updateSettings({ bitcoinUnit: unit }),
					hide: false,
				})),
			},
		],
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[selectedBitcoinUnit],
	);

	return (
		<SettingsView
			title={'Bitcoin'}
			listData={CurrencyListData}
			showBackNavigation
		/>
	);
};

export default memo(BitcoinSettings);
