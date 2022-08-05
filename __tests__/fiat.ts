import { getStore } from '../src/store/helpers';
import { updateExchangeRates } from '../src/store/actions/wallet';
import { getDisplayValues } from '../src/utils/exchange-rate';

global.fetch = require('node-fetch');

describe('Pulls latest fiat exchange rates and checks the wallet store for valid conversions', () => {
	jest.setTimeout(10000);

	it('Blocktank FX rates with default selected currency', async () => {
		const res = await updateExchangeRates();

		expect(res.isOk()).toEqual(true);
		if (res.isErr()) {
			return;
		}

		const { exchangeRates } = getStore().wallet;

		const tickers = Object.keys(exchangeRates);

		//We have some available tickers
		expect(tickers.length).toBeGreaterThan(0);

		//All tickers have the correct format 
		tickers.forEach((ticker) => {
			expect(typeof exchangeRates[ticker].currencySymbol).toBe('string');
			expect(typeof exchangeRates[ticker].quoteName).toBe('string');
			expect(typeof exchangeRates[ticker].rate).toBe('number');
			expect(exchangeRates[ticker].rate).toBeGreaterThan(1);
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
