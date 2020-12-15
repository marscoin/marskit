import { TBitcoinUnit } from './wallet';

type TPinAttemptsRemaining = 0 | 1 | 2 | 3 | 4 | 5;
type TTheme = 'dark' | 'light' | 'blue';

export interface ISettings {
	loading: boolean;
	error: boolean;
	biometrics: boolean;
	pin: boolean;
	pinAttemptsRemaining: TPinAttemptsRemaining;
	theme: TTheme;
	bitcoinUnit: TBitcoinUnit;
	[key: string]: any;
}
