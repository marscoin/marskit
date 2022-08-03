export const mostUsedExchangeTickers = ['USD', 'EUR', 'GBP'];

export interface IExchangeRates {
	[key: string]: {
		quoteName: string
		rate: number
	};
}

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
