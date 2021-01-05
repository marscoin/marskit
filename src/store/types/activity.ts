export enum EActivityTypes {
	lightningPayment = 'lightningPayment',
	lightningInvoice = 'lightningInvoice',
	onChainReceive = 'onChainReceive',
	//TODO add all other activity types as we support them
}

export interface IActivityItem {
	id: string;
	value: number;
	fee?: number; //If receiving we might not know the fee
	description: string;
	type: EActivityTypes;
	confirmed: boolean;
	timestampUtc: number;
}

export interface IActivity {
	items: IActivityItem[];
	itemsFiltered: IActivityItem[];
	searchFilter: string;
	typesFilter: EActivityTypes[];
}
