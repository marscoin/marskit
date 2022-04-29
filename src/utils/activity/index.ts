import { EActivityTypes, IActivityItem } from '../../store/types/activity';
import {
	IFormattedTransaction,
	IFormattedTransactionContent,
} from '../../store/types/wallet';

/**
 * Converts list of formatted transactions to array of activity items
 * @param transactions
 */
export const onChainTransactionsToActivityItems = (
	transactions: IFormattedTransaction,
): IActivityItem[] => {
	let items: IActivityItem[] = [];
	Object.keys(transactions).forEach((txid) => {
		const activityItem = onChainTransactionToActivityItem(transactions[txid]);
		items.push(activityItem);
	});
	return items;
};

/**
 * Converts a formatted transaction to an activity items
 * @param {IFormattedTransactionContent} transaction
 * @return IActivityItem
 */
export const onChainTransactionToActivityItem = (
	transaction: IFormattedTransactionContent,
): IActivityItem => {
	const {
		value,
		fee,
		type: txType,
		address,
		height,
		timestamp,
		messages,
	} = transaction;

	return {
		id: transaction.txid,
		activityType: EActivityTypes.onChain,
		txType,
		confirmed: height > 0,
		value: Math.round(value * 100000000),
		fee,
		message: messages.length > 0 ? messages[0] : '',
		address,
		timestamp,
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
