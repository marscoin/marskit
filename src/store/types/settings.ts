import { IWalletItem, TBitcoinUnit } from './wallet';

type TPinAttemptsRemaining = 0 | 1 | 2 | 3 | 4 | 5;
type TTheme = 'dark' | 'light' | 'blue';
type TProtocol = 'ssl' | 'tcp';

export interface ICustomElectrumPeer {
	host: string;
	port: number;
	protocol: TProtocol;
}

export interface ISettings {
	loading: boolean;
	error: boolean;
	biometrics: boolean;
	pin: boolean;
	pinAttemptsRemaining: TPinAttemptsRemaining;
	theme: TTheme;
	bitcoinUnit: TBitcoinUnit;
	customElectrumPeers: IWalletItem<ICustomElectrumPeer[]> | IWalletItem<[]>;
	[key: string]: any;
}
