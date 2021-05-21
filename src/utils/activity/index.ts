import { lnrpc } from 'react-native-lightning';
import { EActivityTypes, IActivityItem } from '../../store/types/activity';
import { IFormattedTransaction } from '../../store/types/wallet';

/**
 * Converts lightning invoice to activity item
 * @param rHash
 * @param settled
 * @param value
 * @param memo
 * @returns {{fee: number, id: string, txType: "received", activityType: EActivityTypes, message: string, confirmed: boolean, value: number, timestamp: number}}
 * @param creationDate
 */
export const lightningInvoiceToActivityItem = ({
	rHash,
	settled,
	value,
	memo,
	creationDate,
}: lnrpc.IInvoice): IActivityItem => ({
	id: Buffer.from(rHash ?? [0]).toString('hex'),
	activityType: EActivityTypes.lightning,
	txType: 'received',
	confirmed: settled ?? false,
	value: Number(value),
	fee: 0,
	message: memo ?? '',
	timestamp: Number(creationDate) * 1000,
});

/**
 * Converts lightning payment to activity item
 * @returns {{fee: number, id: string, txType: "sent", activityType: EActivityTypes, message: string, confirmed: boolean, value: number, timestamp: number}}
 * @param memo
 * @param paymentHash
 * @param status
 * @param value
 * @param fee
 * @param creationDate
 */
export const lightningPaymentToActivityItem = (
	{ paymentHash, status, value, fee, creationDate }: lnrpc.IPayment,
	memo: string,
): IActivityItem => {
	return {
		id: paymentHash ?? '',
		activityType: EActivityTypes.lightning,
		txType: 'sent',
		confirmed: status === 'SUCCEEDED',
		value: Number(value),
		fee: Number(fee),
		message: memo,
		timestamp: Number(creationDate) * 1000,
	};
};

/**
 * Converts list of formatted transactions to array of activity items
 * @param transactions
 */
export const onChainTransactionsToActivityItems = (
	transactions: IFormattedTransaction,
): IActivityItem[] => {
	let items: IActivityItem[] = [];
	Object.keys(transactions).forEach((txid) => {
		const {
			value,
			fee,
			type: txType,
			address,
			height,
			timestamp,
			messages,
		} = transactions[txid];

		items.push({
			id: txid,
			activityType: EActivityTypes.onChain,
			txType,
			confirmed: height > 0,
			value: Math.round(value * 100000000),
			fee,
			message: messages.length > 0 ? messages[0] : '',
			address,
			timestamp,
		});
	});

	return items;
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
			(newItem) =>
				newItem.activityType === oldItem.activityType &&
				newItem.id === oldItem.id,
		);

		//Found an updated item so replace it
		if (updatedItemIndex > -1) {
			oldItems[index] = newItems[updatedItemIndex];
			newItems.splice(updatedItemIndex, 1);
		}
	});

	return [...oldItems, ...newItems].sort((a, b) => b.timestamp - a.timestamp);
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
		//If there is a search set and it's not found in the message then don't bother continuing
		if (
			search &&
			item.message.toLowerCase().indexOf(search.toLowerCase()) === -1
		) {
			return;
		}

		//Filter not set, assume all
		if (types.length === 0) {
			filteredItems.push(item);
			return;
		}

		let existsInFilter = false;
		types.forEach((type) => {
			if (item.activityType === type) {
				existsInFilter = true;
			}
		});

		if (existsInFilter) {
			filteredItems.push(item);
		}
	});

	return filteredItems;
};
