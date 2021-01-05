import { lnrpc } from 'react-native-lightning/dist/rpc';
import { EActivityTypes, IActivityItem } from '../../store/types/activity';

/**
 * Converts lightning invoice to activity item
 * @param rHash
 * @param settled
 * @param value
 * @param memo
 * @returns {{fee: number, description: string, id: string, type: EActivityTypes, confirmed: boolean, value: number}}
 */
export const lightningInvoiceToActivityItem = ({
	rHash,
	settled,
	value,
	memo,
	creationDate,
}: lnrpc.IInvoice): IActivityItem => ({
	id: Buffer.from(rHash ?? [0]).toString('hex'),
	type: EActivityTypes.lightningInvoice,
	confirmed: settled ?? false,
	value: Number(value),
	fee: 0,
	description: memo ?? '',
	timestampUtc: Number(creationDate) * 1000,
});

/**
 * Converts lightning payment to activity item
 * @param paymentHash
 * @param status
 * @param value
 * @param fee
 * @param creationDate
 * @param description
 * @returns {{fee: number, description: string, id: string, timestampUtc: number, type: EActivityTypes, confirmed: boolean, value: number}}
 */
export const lightningPaymentToActivityItem = (
	{ paymentHash, status, value, fee, creationDate }: lnrpc.IPayment,
	description: string,
): IActivityItem => {
	return {
		id: paymentHash ?? '',
		type: EActivityTypes.lightningPayment,
		confirmed: status === 2,
		value: Number(value),
		fee: Number(fee),
		description,
		timestampUtc: Number(creationDate) * 1000,
	};
};

/**
 * Appends any new activity items while updating existing ones
 * @param oldItems
 * @param newItems
 * @returns {IActivityItem[]}
 */
export const mergeActivityItems = (
	oldItems: IActivityItem[],
	newItems: IActivityItem[],
): IActivityItem[] => {
	oldItems.forEach((oldItem, index) => {
		const updatedItemIndex = newItems.findIndex(
			(newItem) => newItem.type === oldItem.type && newItem.id === oldItem.id,
		);

		//Found an updated item so replace it
		if (updatedItemIndex > -1) {
			oldItems[index] = newItems[updatedItemIndex];
			newItems.splice(updatedItemIndex, 1);
		}
	});

	return [...oldItems, ...newItems].sort(
		(a, b) => b.timestampUtc - a.timestampUtc,
	);
};

/**
 * Filters activity items based on search string or type list
 * @param items
 * @param search
 * @param types
 */
export const filterActivityItems = (
	items: IActivityItem[],
	search: string,
	types: EActivityTypes[],
): IActivityItem[] => {
	let filteredItems: IActivityItem[] = [];

	items.forEach((item) => {
		//If there is a search set and it's not found in the description then don't bother continuing
		if (search && item.description.indexOf(search) === -1) {
			return;
		}

		//Filter not set, assume all
		if (types.length === 0) {
			filteredItems.push(item);
			return;
		}

		let existsInFilter = false;
		types.forEach((type) => {
			if (item.type === type) {
				existsInFilter = true;
			}
		});

		if (existsInFilter) {
			filteredItems.push(item);
		}
	});

	return filteredItems;
};
