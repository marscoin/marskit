export interface IOmniBolt {
	loading: boolean;
	error: boolean;
	selectedWallet: string;
	wallets: object;
	[key: string]: any;
}
