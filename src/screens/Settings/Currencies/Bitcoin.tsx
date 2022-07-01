import React, { memo, ReactElement, useMemo } from 'react';

import { IListData } from '../../../components/List';
import SettingsView from '../SettingsView';
import { useSelector } from 'react-redux';
import Store from '../../../store/types';
import { updateSettings } from '../../../store/actions/settings';

import BitcoinUnitBtcSVG from '../../../assets/icons/bitcoin-unit-btc.svg';
import BitcoinUnitSatoshisSVG from '../../../assets/icons/bitcoin-unit-satoshis.svg';

const BitcoinSettings = (): ReactElement => {
	const selectedBitcoinUnit = useSelector(
		(state: Store) => state.settings.bitcoinUnit,
	);

	const bitcoinUnits = [
		{
			label: 'Bitcoin',
			unit: 'BTC',
			labelExample: '(0.0001000)',
			Icon: BitcoinUnitBtcSVG,
		},
		{
			label: 'Satoshis',
			unit: 'satoshi',
			labelExample: '(1 000)',
			Icon: BitcoinUnitSatoshisSVG,
		},
	];

	const CurrencyListData: IListData[] = useMemo(
		() => [
			{
				title: 'Display Bitcoin amounts as',
				data: bitcoinUnits.map((bitcoinUnit) => ({
					title: `${bitcoinUnit.label} ${bitcoinUnit.labelExample}`,
					value: bitcoinUnit.unit === selectedBitcoinUnit,
					type: 'button',
					onPress: (): any => updateSettings({ bitcoinUnit: bitcoinUnit.unit }),
					hide: false,
					Icon: bitcoinUnit.Icon,
				})),
			},
		],
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[selectedBitcoinUnit],
	);

	return (
		<SettingsView
			title={'Bitcoin unit'}
			listData={CurrencyListData}
			showBackNavigation
		/>
	);
};

export default memo(BitcoinSettings);
