import { default as bitcoinUnits } from 'bitcoin-units';
import { err, ok, Result } from '../result';
import { getStore } from '../../store/helpers';
import { TBitcoinUnit } from '../../store/types/wallet';

export enum EExchangeRateService {
	bitfinex = 'Bitfinex',
	cryptoCompare = 'Crypto Compare',
}

export const supportedExchangeTickers = {
	[EExchangeRateService.bitfinex]: ['USD', 'EUR', 'JPY', 'GBP'],
	[EExchangeRateService.cryptoCompare]: ['USD', 'EUR', 'JPY', 'GBP', 'ZAR'],
};

export interface IExchangeRates {
	[key: string]: number;
}

export type IExchangeTickers = {
	[key in EExchangeRateService]: string[];
};

export const getExchangeRates = async (): Promise<Result<IExchangeRates>> => {
	const { exchangeRateService } = getStore().settings;

	switch (exchangeRateService) {
		case 'Crypto Compare': {
			return getCryptoCompareRates();
		}
		case 'Bitfinex':
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
	fiatSymbol: string; //$,€,£
	bitcoinFormatted: string;
	bitcoinSymbol: string;
}

export const defaultDisplayValues: IDisplayValues = {
	fiatFormatted: '-',
	fiatSymbol: '',
	bitcoinFormatted: '-',
	bitcoinSymbol: '',
};

export const getDisplayValues = ({
	satoshis,
	exchangeRate,
	currency,
	bitcoinUnit,
	locale,
}: {
	satoshis: number;
	exchangeRate: number;
	currency: string;
	bitcoinUnit: TBitcoinUnit;
	locale: string;
}): IDisplayValues => {
	try {
		bitcoinUnits.setFiat(currency, exchangeRate);
		let fiatValue = exchangeRate
			? bitcoinUnits(satoshis, 'satoshi').to(currency).value().toFixed(2)
			: '-';

		const fiatFormattedIntl = new Intl.NumberFormat(locale, {
			style: 'currency',
			currency,
		});
		let fiatFormatted = fiatFormattedIntl.format(fiatValue);

		let fiatSymbol = '';
		fiatFormattedIntl.formatToParts(fiatValue).forEach((part) => {
			if (part.type === 'currency') {
				fiatSymbol = part.value;
			}
		});

		fiatFormatted = fiatFormatted.replace(fiatSymbol, '');

		const bitcoinFormatted = bitcoinUnits(satoshis, 'satoshi')
			.to(bitcoinUnit)
			.value()
			.toString();

		let bitcoinSymbol = '';
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
				break;
		}

		return {
			fiatFormatted,
			fiatSymbol,
			bitcoinFormatted,
			bitcoinSymbol,
		};
	} catch (e) {
		console.error(e);
		return defaultDisplayValues;
	}
};
