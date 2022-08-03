import React, { memo, ReactElement, useMemo } from 'react';

import { IListData } from '../../../components/List';
import SettingsView from '../SettingsView';
import { useSelector } from 'react-redux';
import Store from '../../../store/types';
import { mostUsedExchangeTickers } from '../../../utils/exchange-rate/types';
import { updateSettings } from '../../../store/actions/settings';

const Currencies = (): ReactElement => {
	const exchangeRates = useSelector(
		(state: Store) => state.wallet.exchangeRates,
	);

	const selectedCurrency = useSelector(
		(state: Store) => state.settings.selectedCurrency,
	);

	const onSetCurrency = (currency: String): void => {
		updateSettings({ selectedCurrency: currency });
	};

	const CurrencyListData: IListData[] = useMemo(
		() => [
			{
				title: 'Most Used',
				data: mostUsedExchangeTickers.map((ticker) => ({
					title: ticker,
					value: selectedCurrency === ticker,
					type: 'button',
					onPress: (): void => onSetCurrency(ticker),
					hide: false,
				})),
			},
			{
				title: 'All',
				data: Object.keys(exchangeRates).map((ticker) => ({
					title: `${ticker} — ${exchangeRates[ticker].quoteName}`,
					value: selectedCurrency === ticker,
					type: 'button',
					onPress: (): void => onSetCurrency(ticker),
					hide: false,
				})),
			},
		],
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[selectedCurrency],
	);

	return (
		<SettingsView
			title={'Currencies'}
			listData={CurrencyListData}
			showBackNavigation
		/>
	);
};

export default memo(Currencies);
