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
		if (Object.entries(exchangeRates).length === 0) {
			return defaultDisplayValues;
		}

		const exchangeRate = exchangeRates[selectedCurrency].rate;

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

/**
 * Returns 0 if no exchange rate for currency found or something goes wrong
 */
export const useExchangeRate = (currency = 'EUR'): number => {
	try {
		const exchangeRates = useSelector(
			(state: Store) => state.wallet.exchangeRates,
		);
		return exchangeRates[currency]?.rate ?? 0;
	} catch {
		return 0;
	}
};
