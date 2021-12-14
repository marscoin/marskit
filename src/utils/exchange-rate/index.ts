import { default as bitcoinUnits } from 'bitcoin-units';
import { ok, Result } from '../result';
import { getStore } from '../../store/helpers';
import { TBitcoinUnit } from '../../store/types/wallet';

export enum EExchangeRateService {
	bitfinex = 'bitfinex',
	cryptoCompare = 'cryptoCompare',
}

export const exchangeRateServices = {
	[EExchangeRateService.bitfinex]: 'Bitfinex',
	[EExchangeRateService.cryptoCompare]: 'Crypto Compare',
};

export const supportedExchangeTickers = {
	[EExchangeRateService.bitfinex]: ['USD', 'EUR', 'JPY', 'GBP'],
	[EExchangeRateService.cryptoCompare]: [
		'USD',
		'EUR',
		'JPY',
		'GBP',
		'ZAR',
		'CAD',
		'CNY',
	],
};

export const mostUsedExchangeTickers = {
	[EExchangeRateService.bitfinex]: ['USD', 'EUR', 'GBP'],
	[EExchangeRateService.cryptoCompare]: ['USD', 'EUR', 'GBP'],
};

export interface IExchangeRates {
	[key: string]: number;
}

export type IExchangeTickers = {
	[key in EExchangeRateService]: string[];
};

export const getExchangeRates = async (): Promise<Result<IExchangeRates>> => {
	let { exchangeRateService } = getStore().settings;

	const service = exchangeRateService
		? EExchangeRateService[exchangeRateService]
		: EExchangeRateService.bitfinex;

	switch (service) {
		case EExchangeRateService.cryptoCompare: {
			return getCryptoCompareRates();
		}
		case EExchangeRateService.bitfinex:
		default: {
			return getBitfinexRates();
		}
	}
};

const getBitfinexRates = async (): Promise<Result<IExchangeRates>> => {
	const rates: IExchangeRates = {};

	const response = await fetch(
		`https://api-pub.bitfinex.com/v2/tickers?symbols=${supportedExchangeTickers[
			EExchangeRateService.bitfinex
		]
			.map((c) => `tBTC${c}`)
			.join(',')}`,
	);

	const jsonResponse = (await response.json()) as Array<Array<string>>;
	jsonResponse.forEach((a) => {
		rates[a[0].replace('tBTC', '')] = Math.round(Number(a[10]) * 100) / 100;
	});

	return ok(rates);
};

const getCryptoCompareRates = async (): Promise<Result<IExchangeRates>> => {
	const response = await fetch(
		`https://min-api.cryptocompare.com/data/price?fsym=BTC&tsyms=${supportedExchangeTickers[
			EExchangeRateService.cryptoCompare
		]
			.map((c) => `${c}`)
			.join(',')}`,
	);

	return ok((await response.json()) as IExchangeRates);
};

export interface IDisplayValues {
	fiatFormatted: string;
	fiatWhole: string; //Value before decimal point
	fiatDecimal: string; //Decimal point "." or ","
	fiatDecimalValue: string; // Value after decimal point
	fiatSymbol: string; //$,€,£
	fiatTicker: string; //USD, EUR
	bitcoinFormatted: string;
	bitcoinSymbol: string; //₿, m₿, μ₿, ⚡,
	bitcoinTicker: string; //BTC, mBTC, μBTC, Sats
	satoshis: number;
}

export const defaultDisplayValues: IDisplayValues = {
	fiatFormatted: '-',
	fiatWhole: '',
	fiatDecimal: '',
	fiatDecimalValue: '',
	fiatSymbol: '',
	fiatTicker: '',
	bitcoinFormatted: '-',
	bitcoinSymbol: '',
	bitcoinTicker: '',
	satoshis: 0,
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
			const exchangeRates = getStore().wallet.exchangeRates[currency] || {};
			exchangeRate = exchangeRates[currency];
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

		const bitcoinFormatted = bitcoinUnits(satoshis, 'satoshi')
			.to(bitcoinUnit)
			.value()
			.toString();

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
				bitcoinTicker = 'Sats';
				break;
		}

		return {
			fiatFormatted,
			fiatWhole,
			fiatDecimal,
			fiatDecimalValue,
			fiatSymbol,
			fiatTicker: currency,
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
