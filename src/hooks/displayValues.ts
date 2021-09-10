import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import Store from '../store/types';
import {
	defaultDisplayValues,
	getDisplayValues,
	IDisplayValues,
} from '../utils/exchange-rate';

export default function useDisplayValues(sats: number): IDisplayValues {
	const [displayValues, setDisplayValues] =
		useState<IDisplayValues>(defaultDisplayValues);

	const bitcoinUnit = useSelector((state: Store) => state.settings.bitcoinUnit);
	const selectedCurrency = useSelector(
		(state: Store) => state.settings.selectedCurrency,
	);
	const exchangeRates = useSelector(
		(state: Store) => state.wallet.exchangeRates,
	);

	useEffect((): void => {
		//Exchange rates haven't loaded yet
		if (!exchangeRates) {
			return;
		}

		const exchangeRate = exchangeRates[selectedCurrency];

		setDisplayValues(
			getDisplayValues({
				satoshis: sats,
				exchangeRate,
				currency: selectedCurrency,
				bitcoinUnit: bitcoinUnit,
				locale: 'en-US', //TODO get from native module
			}),
		);
	}, [sats, selectedCurrency, bitcoinUnit, exchangeRates]);

	return displayValues;
}
