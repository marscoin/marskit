import { ECPairInterface } from "bitcoinjs-lib";
import { AvailableNetworks, INetwork } from "../networks";
import { AddressType, IAddress, KeyDerivationPath } from "../../store/types/wallet";

export interface IResponse<T> {
	error: boolean;
	data: T | Object | string;
}

export interface ISetKeychainValue {
	key: string;
	value: string;
}

export interface IGetKeychainValue { key: string }

export interface IGetAddress {
	keyPair: ECPairInterface | undefined;
	network: INetwork | undefined;
	type?: AddressType
}

export interface IGetInfoFromAddressPath {
	error: boolean,
	isChangeAddress?: boolean,
	addressIndex?: number,
	data?: string
}

export interface IGenerateAddresses {
	wallet: string,
	addressAmount?: number,
	changeAddressAmount?: number,
	addressIndex?: number,
	changeAddressIndex?: number,
	selectedNetwork?: AvailableNetworks,
	keyDerivationPath?: KeyDerivationPath,
	addressType?: AddressType,
}

export interface IGenerateAddressesResponse {
	error: boolean,
	data: {
		addresses: IAddress[],
		changeAddresses: IAddress[]
	}
}
