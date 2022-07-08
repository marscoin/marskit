import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import Store from '../store/types';
import { getDisplayValues } from '../utils/exchange-rate';
import {
	defaultDisplayValues,
	IDisplayValues,
} from '../utils/exchange-rate/types';
import { TBitcoinUnit } from '../store/types/wallet';

export default function useDisplayValues(
	sats: number,
	bitcoinUnit?: TBitcoinUnit,
): IDisplayValues {
	const stateUnit = useSelector((state: Store) => state.settings.bitcoinUnit);
	const selectedCurrency = useSelector(
		(state: Store) => state.settings.selectedCurrency,
	);
	const exchangeRates = useSelector(
		(state: Store) => state.wallet.exchangeRates,
	);

	bitcoinUnit = bitcoinUnit ?? stateUnit;

	const displayValues: IDisplayValues = useMemo(() => {
		//Exchange rates haven't loaded yet
		if (!exchangeRates) {
			return defaultDisplayValues;
		}

		const exchangeRate = exchangeRates[selectedCurrency];

		return getDisplayValues({
			satoshis: sats,
			exchangeRate,
			currency: selectedCurrency,
			bitcoinUnit: bitcoinUnit,
			locale: 'en-US', //TODO get from native module
		});
	}, [sats, selectedCurrency, bitcoinUnit, exchangeRates]);

	return displayValues;
}
