import { getStore } from '../src/store/helpers';
import { updateExchangeRates } from '../src/store/actions/wallet';
import {
	EExchangeRateService,
	getDisplayValues,
	supportedExchangeTickers,
} from '../src/utils/exchange-rate';
import { updateSettings } from '../src/store/actions/settings';

global.fetch = require('node-fetch');

describe('Pulls latest fiat exchange rates and checks the wallet store for valid conversions', () => {
	jest.setTimeout(10000);

	it('Bitfinex rates with default selected currency', async () => {
		const res = await updateExchangeRates();

		expect(res.isOk()).toEqual(true);
		if (res.isErr()) {
			return;
		}

		const { exchangeRates } = getStore().wallet;

		const tickers = Object.keys(exchangeRates);

		//We have some available tickers
		expect(tickers.length).toBe(
			supportedExchangeTickers[EExchangeRateService.bitfinex].length,
		);

		//Every ticker stored needs to be a valid number
		tickers.forEach((ticker) => {
			expect(typeof exchangeRates[ticker]).toBe('number');
			expect(exchangeRates[ticker]).toBeGreaterThan(1);
		});
	});

	it('Crypto Compare rates with new selected currency', async () => {
		updateSettings({
			exchangeRateService: 'cryptoCompare',
			selectedCurrency: 'EUR',
		});

		const res = await updateExchangeRates();

		expect(res.isOk()).toEqual(true);
		if (res.isErr()) {
			return;
		}

		const { exchangeRates } = getStore().wallet;

		const tickers = Object.keys(exchangeRates);

		//We have some available tickers
		expect(tickers.length).toBe(
			supportedExchangeTickers[EExchangeRateService.cryptoCompare].length,
		);

		//Every ticker stored needs to be a valid number
		tickers.forEach((ticker) => {
			expect(typeof exchangeRates[ticker]).toBe('number');
			expect(exchangeRates[ticker]).toBeGreaterThan(1);
		});
	});

	it('Formats all display values in USD formatted with correct locale', async () => {
		//Testing the react hook
		const { fiatFormatted, fiatSymbol, bitcoinFormatted, bitcoinSymbol } =
			getDisplayValues({
				satoshis: 1010101,
				exchangeRate: 100000,
				currency: 'USD',
				bitcoinUnit: 'BTC',
				locale: 'en-US',
			});

		expect(fiatFormatted).toBe('1,010.10');
		expect(fiatSymbol).toBe('$');
		expect(bitcoinFormatted).toBe('0.01010101');
		expect(bitcoinSymbol).toBe('₿');
	});
});
