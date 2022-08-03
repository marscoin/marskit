import { default as bitcoinUnits } from 'bitcoin-units';
import { ok, Result } from '../result';
import { getStore } from '../../store/helpers';
import { TBitcoinUnit } from '../../store/types/wallet';
import { defaultDisplayValues, IDisplayValues, IExchangeRates } from './types';

export const getExchangeRates = async (): Promise<Result<IExchangeRates>> => {
	// TODO: pull this out into .env
	const response = await fetch('http://35.233.47.252:443/fx/rates/btc');
	const { tickers } = await response.json();

	const rates: IExchangeRates = tickers.reduce((acc, ticker) => {
		return {
			...acc,
			[ticker.quote]: {
				currencySymbol: ticker.currencySymbol,
				quoteName: ticker.quoteName,
				rate: Math.round(Number(ticker.lastPrice) * 100) / 100,
			},
		};
	}, {});

	return ok(rates);
};

export const fiatToBitcoinUnit = ({
	fiatValue,
	exchangeRate,
	currency,
	bitcoinUnit,
}: {
	fiatValue: string;
	exchangeRate?: number;
	currency?: string;
	bitcoinUnit?: TBitcoinUnit;
}): string => {
	if (!currency) {
		currency = getStore().settings.selectedCurrency;
	}
	if (!exchangeRate) {
		exchangeRate = getStore().wallet.exchangeRates[currency].rate || 0;
	}
	if (!bitcoinUnit) {
		bitcoinUnit = getStore().settings.bitcoinUnit;
	}
	bitcoinUnits.setFiat(currency, exchangeRate);

	const value = bitcoinUnits(Number(fiatValue), currency)
		.to(bitcoinUnit)
		.value()
		.toFixed(bitcoinUnit === 'satoshi' ? 0 : 8); // satoshi cannot be a fractional number

	return value;
};

export const getDisplayValues = ({
	satoshis,
	exchangeRate,
	currency,
	bitcoinUnit,
	locale = 'en-US',
}: {
	satoshis: number;
	exchangeRate?: number;
	currency?: string;
	bitcoinUnit?: TBitcoinUnit;
	locale?: string;
}): IDisplayValues => {
	try {
		if (!currency) {
			currency = getStore().settings.selectedCurrency;
		}
		if (!exchangeRate) {
			exchangeRate = getStore().wallet.exchangeRates[currency].rate || 0;
		}
		if (!bitcoinUnit) {
			bitcoinUnit = getStore().settings.bitcoinUnit;
		}

		bitcoinUnits.setFiat(currency, exchangeRate);
		let fiatValue = exchangeRate
			? bitcoinUnits(satoshis, 'satoshi').to(currency).value().toFixed(2)
			: '-';

		let {
			fiatFormatted,
			fiatWhole,
			fiatDecimal,
			fiatDecimalValue,
			fiatSymbol,
		} = defaultDisplayValues;

		if (!isNaN(fiatValue)) {
			const fiatFormattedIntl = new Intl.NumberFormat(locale, {
				style: 'currency',
				currency,
			});
			fiatFormatted = fiatFormattedIntl.format(fiatValue);

			fiatFormattedIntl.formatToParts(fiatValue).forEach((part) => {
				if (part.type === 'currency') {
					fiatSymbol = part.value;
				} else if (part.type === 'integer' || part.type === 'group') {
					fiatWhole = `${fiatWhole}${part.value}`;
				} else if (part.type === 'fraction') {
					fiatDecimalValue = part.value;
				} else if (part.type === 'decimal') {
					fiatDecimal = part.value;
				}
			});

			fiatFormatted = isNaN(fiatValue)
				? '-'
				: fiatFormatted.replace(fiatSymbol, '');
		}

		let bitcoinFormatted = bitcoinUnits(satoshis, 'satoshi')
			.to(bitcoinUnit)
			.value()
			.toFixed(bitcoinUnit === 'satoshi' ? 0 : 8)
			.toString();

		// format sats to group thousands
		// 4000000 -> 4 000 000
		if (bitcoinUnit === 'satoshi') {
			let res = '';
			bitcoinFormatted
				.split('')
				.reverse()
				.forEach((c, index) => {
					if (index > 0 && index % 3 === 0) {
						res = ' ' + res;
					}
					res = c + res;
				});
			bitcoinFormatted = res;
		}

		let { bitcoinSymbol } = defaultDisplayValues;
		let bitcoinTicker = bitcoinUnit.toString();
		switch (bitcoinUnit) {
			case 'BTC':
				bitcoinSymbol = '₿';
				break;
			case 'mBTC':
				bitcoinSymbol = 'm₿';
				break;
			case 'μBTC':
				bitcoinSymbol = 'μ₿';
				break;
			case 'satoshi':
				bitcoinSymbol = '⚡';
				bitcoinTicker = 'sats';
				break;
		}

		return {
			fiatFormatted,
			fiatWhole,
			fiatDecimal,
			fiatDecimalValue,
			fiatSymbol,
			fiatTicker: currency,
			fiatValue: Number(fiatValue),
			bitcoinFormatted,
			bitcoinSymbol,
			bitcoinTicker,
			satoshis,
		};
	} catch (e) {
		console.error(e);
		return defaultDisplayValues;
	}
};
