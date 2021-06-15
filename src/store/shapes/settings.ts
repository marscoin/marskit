import { ISettings } from '../types/settings';
import { arrayTypeItems } from './wallet';
import { EExchangeRateService } from '../../utils/exchange-rate';

export const defaultSettingsShape: ISettings = {
	loading: false,
	error: false,
	biometrics: false,
	pin: false,
	theme: 'dark',
	bitcoinUnit: 'satoshi', //BTC, mBTC, μBTC or satoshi
	selectedCurrency: 'USD',
	exchangeRateService: EExchangeRateService.bitfinex,
	selectedLanguage: 'english',
	customElectrumPeers: { ...arrayTypeItems },
};
