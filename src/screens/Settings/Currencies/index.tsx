import React, { memo, ReactElement, useCallback, useMemo } from 'react';

import { IListData } from '../../../components/List';
import SettingsView from '../SettingsView';
import { useSelector } from 'react-redux';
import Store from '../../../store/types';
import {
	EExchangeRateService,
	exchangeRateServices,
	supportedExchangeTickers,
} from '../../../utils/exchange-rate';
import { updateSettings } from '../../../store/actions/settings';
import { updateExchangeRates } from '../../../store/actions/wallet';

const Currencies = ({ navigation }): ReactElement => {
	const exchangeRateServicesKeys = Object.keys(EExchangeRateService).filter(
		(key) => isNaN(Number(EExchangeRateService[key])),
	);

	const selectedExchangeRateService = useSelector(
		(state: Store) => state.settings.exchangeRateService,
	);

	const selectedCurrency = useSelector(
		(state: Store) => state.settings.selectedCurrency,
	);

	const onSetExchangeRateService = useCallback(
		(provider: EExchangeRateService): void => {
			updateSettings({ exchangeRateService: provider });

			setTimeout(() => {
				updateExchangeRates().then();

				//Check if we support the current currency on this provider
				const availableTickers =
					supportedExchangeTickers[EExchangeRateService[provider]];
				if (!availableTickers.includes(selectedCurrency)) {
					updateSettings({ selectedCurrency: availableTickers[0] });
				}
			}, 250);
		},
		[selectedCurrency],
	);

	const CurrencyListData: IListData[] = useMemo(
		() => [
			{
				title: 'Exchange rate service',
				data: exchangeRateServicesKeys.map((service) => ({
					title: exchangeRateServices[service],
					value: service === selectedExchangeRateService,
					type: 'button',
					onPress: (): void =>
						onSetExchangeRateService(EExchangeRateService[service]),
					hide: false,
				})),
			},
			{
				title: 'Most Used',
				data: [
					{
						title: 'USD',
						value: '',
						type: 'button',
						onPress: () => alert('USD'),
						hide: false,
					},
				],
			},
		],
		[
			selectedExchangeRateService,
			onSetExchangeRateService,
			exchangeRateServicesKeys,
			navigation,
		],
	);

	return (
		<SettingsView
			title={'Currencies'}
			data={CurrencyListData}
			showBackNavigation
		/>
	);
};

export default memo(Currencies);
