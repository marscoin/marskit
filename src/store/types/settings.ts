import { IWalletItem, TBitcoinUnit } from './wallet';
import { EExchangeRateService } from '../../utils/exchange-rate';

type TTheme = 'dark' | 'light' | 'blue';
type TProtocol = 'ssl' | 'tcp';

export interface ICustomElectrumPeer {
	host: string;
	ssl: number; //ssl port
	tcp: number; //tcp port
	protocol?: TProtocol;
}

export interface ISettings {
	loading: boolean;
	error: boolean;
	biometrics: boolean;
	pin: boolean;
	theme: TTheme;
	bitcoinUnit: TBitcoinUnit;
	customElectrumPeers: IWalletItem<ICustomElectrumPeer[]> | IWalletItem<[]>;
	selectedCurrency: string;
	exchangeRateService: EExchangeRateService;
	selectedLanguage: string;
	[key: string]: any;
}
