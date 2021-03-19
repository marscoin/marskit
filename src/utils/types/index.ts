import { ECPairInterface } from 'bitcoinjs-lib';
import { TAvailableNetworks, INetwork } from '../networks';
import {
	TAddressType,
	IAddress,
	IKeyDerivationPath,
	TKeyDerivationAccountType,
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
	selectedWallet?: string | undefined;
	addressAmount?: number;
	changeAddressAmount?: number;
	addressIndex?: number;
	changeAddressIndex?: number;
	selectedNetwork?: TAvailableNetworks | undefined;
	keyDerivationPath?: IKeyDerivationPath | undefined;
	accountType?: TKeyDerivationAccountType;
	addressType?: TAddressType;
}

export interface IGenerateAddressesResponse {
	addresses: IAddress;
	changeAddresses: IAddress;
}
