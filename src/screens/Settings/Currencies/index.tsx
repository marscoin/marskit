import React, { memo, ReactElement, useMemo } from 'react';
import { useNavigation } from '@react-navigation/native';

import { IListData } from '../../../components/List';
import SettingsView from '../SettingsView';
import { useSelector } from 'react-redux';
import Store from '../../../store/types';
import { mostUsedExchangeTickers } from '../../../utils/exchange-rate/types';
import { updateSettings } from '../../../store/actions/settings';

const Currencies = (): ReactElement => {
	const navigation = useNavigation();

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
					title: `${ticker} (${exchangeRates[ticker].currencySymbol})`,
					value: selectedCurrency === ticker,
					type: 'button',
					onPress: (): void => {
						navigation.goBack();
						onSetCurrency(ticker);
					},
					hide: false,
				})),
			},
			{
				title: 'Other Currencies',
				data: Object.keys(exchangeRates).map((ticker) => ({
					title: ticker,
					value: selectedCurrency === ticker,
					type: 'button',
					onPress: (): void => {
						navigation.goBack();
						onSetCurrency(ticker);
					},
					hide: false,
				})),
			},
		],
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[selectedCurrency],
	);

	return (
		<SettingsView
			title={'Local currency'}
			listData={CurrencyListData}
			showBackNavigation
			showSearch
		/>
	);
};

export default memo(Currencies);
