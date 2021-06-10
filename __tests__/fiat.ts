import { getStore } from '../src/store/helpers';
import { updateExchangeRates } from '../src/store/actions/wallet';
import {
	EExchangeRateService,
	supportedExchangeTickers,
} from '../src/utils/fiat';
import { setExchangeCurrency } from '../src/store/actions/settings';

global.fetch = require('node-fetch');

describe('Pulls latest exchange rates and checks the wallet store for valid conversions', () => {
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
		setExchangeCurrency(EExchangeRateService.cryptoCompare, 'EUR');

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
});
