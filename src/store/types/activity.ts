import { TTransactionType } from './wallet';

export enum EActivityTypes {
	lightning = 'lightning',
	onChain = 'onChain',
	//TODO add all other activity types as we support them
}

export interface IActivityItem {
	id: string;
	value: number;
	fee?: number; //If receiving we might not know the fee
	message: string;
	address?: string;
	activityType: EActivityTypes;
	txType: TTransactionType;
	confirmed: boolean;
	timestamp: number;
}

export interface IActivity {
	items: IActivityItem[];
	itemsFiltered: IActivityItem[];
	searchFilter: string;
	typesFilter: EActivityTypes[];
	//TODO set TAvailableNetworks
}
