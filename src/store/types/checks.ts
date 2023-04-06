import { EAddressType, IAddress, IWalletItem, TWalletName } from './wallet';
import { TAvailableNetworks } from '../../utils/networks';

export enum EWarningIds {
	'storageCheck' = 826,
}

export type TMinMaxAddressData = {
	minGeneratedAddress: IAddress | undefined;
	maxGeneratedAddress: IAddress | undefined;
	minStoredAddress: IAddress | undefined;
	maxStoredAddress: IAddress | undefined;
	minMatch: boolean;
	maxMatch: boolean;
};

export type TMinMaxData = {
	address: TMinMaxAddressData;
	changeAddress: TMinMaxAddressData;
	addressType: EAddressType;
	selectedNetwork: TAvailableNetworks;
};

export type TAddressStorageCheckRes = {
	allMatch: boolean;
	data: TMinMaxData[];
};

export type TImpactedAddressesData = {
	storedAddress: IAddress;
	generatedAddress: IAddress;
};

export type TGetImpactedAddressesRes = {
	impactedAddresses: TImpactedAddresses[];
	impactedChangeAddresses: TImpactedAddresses[];
};

export type TImpactedAddresses = {
	addressType: EAddressType;
	addresses: TImpactedAddressesData[];
};

export type TStorageWarning = {
	id: string;
	warningId: EWarningIds;
	data: TGetImpactedAddressesRes;
	warningReported: boolean;
	timestamp: number;
};

export interface IChecksShape {
	[key: TWalletName]: IChecksContent;
}

export interface IChecksContent {
	warnings: IWalletItem<TStorageWarning[]>;
}
