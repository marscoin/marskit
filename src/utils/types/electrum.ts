import { TAvailableNetworks } from '../networks';

export interface IHeader {
	height: number;
	hash: string;
	hex: string;
}

export interface IGetHeaderResponse {
	id: Number;
	error: boolean;
	method: 'getHeader';
	data: string;
	network: TAvailableNetworks;
}
