import { ECPairInterface } from "bitcoinjs-lib";
import { INetwork } from "../networks";
import { IAddress } from "../../store/types/wallet";

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
	type?: string
}

export interface IGetInfoFromAddressPath {
	error: boolean,
	isChangeAddress?: boolean,
	addressIndex?: number,
	data?: string
}

export interface IGenerateAddresses {
	error: boolean,
	data: {
		addresses: IAddress[],
		changeAddresses: IAddress[]
	}
}
