import { ECPairInterface } from 'bitcoinjs-lib';
import { TAvailableNetworks, INetwork } from '../networks';
import {
	TAddressType,
	IAddress,
	TKeyDerivationPath,
} from '../../store/types/wallet';

export interface IResponse<T> {
	error: boolean;
	data: T;
}

export interface ISetKeychainValue {
	key: string;
	value: string;
}

export interface IGetKeychainValue {
	key: string;
}

export interface IGetAddress {
	keyPair: ECPairInterface | undefined;
	network: INetwork | undefined;
	type?: TAddressType;
}

export interface IGetInfoFromAddressPath {
	error: boolean;
	isChangeAddress?: boolean;
	addressIndex?: number;
	data?: string;
}

export interface IGenerateAddresses {
	wallet: string;
	addressAmount?: number;
	changeAddressAmount?: number;
	addressIndex?: number;
	changeAddressIndex?: number;
	selectedNetwork?: TAvailableNetworks;
	keyDerivationPath?: TKeyDerivationPath;
	addressType?: TAddressType;
}

export interface IGenerateAddressesResponse {
	addresses: IAddress;
	changeAddresses: IAddress;
}

export interface IUtxo {
	height: number;
	tx_hash: string;
	tx_pos: number;
	value: number;
}
export interface IUtxos extends IUtxo {
	address: string;
	index: number;
	path: string;
	scriptHash: string;
}
