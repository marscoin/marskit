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

export interface IDisplayValues {
	fiatFormatted: string;
	fiatWhole: string; //Value before decimal point
	fiatDecimal: string; //Decimal point "." or ","
	fiatDecimalValue: string; // Value after decimal point
	fiatSymbol: string; //$,€,£
	fiatTicker: string; //USD, EUR
	fiatValue: number;
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
	fiatValue: 0,
	bitcoinFormatted: '-',
	bitcoinSymbol: '',
	bitcoinTicker: '',
	satoshis: 0,
};
