import { err, ok, Result } from '../result';
import { getStore } from '../../store/helpers';

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
		case 'Bitfinex': {
			return getBitfinexRates();
		}
		case 'Crypto Compare': {
			return getCryptoCompareRates();
		}
	}

	return err(`Unsupported exchange rat service: ${exchangeRateService}`);
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
