import {
	EActivityTypes,
	IActivityItem,
	IActivityItemFormatted,
} from '../../store/types/activity';
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

export const groupActivityItems = (
	activityItems: IActivityItem[],
): IActivityItemFormatted[] => {
	const date = new Date();
	const beginningOfDay = +new Date(
		date.getFullYear(),
		date.getMonth(),
		date.getDate(),
	);
	const beginningOfYesterday = +new Date(
		date.getFullYear(),
		date.getMonth(),
		date.getDate() - 1,
	);
	const beginningOfMonth = +new Date(date.getFullYear(), date.getMonth());
	const beginningOfYear = +new Date(date.getFullYear());

	const today: Array<any> = [];
	const yesterday: Array<any> = [];
	const month: Array<any> = [];
	const year: Array<any> = [];
	const earlier: Array<any> = [];

	for (let item of activityItems) {
		if (item.timestamp >= beginningOfDay) {
			// today format as 22:40
			today.push({
				...item,
				formattedDate: new Date(item.timestamp).toLocaleString(undefined, {
					hour: 'numeric',
					minute: 'numeric',
					hour12: false,
				}),
			});
		} else if (item.timestamp >= beginningOfYesterday) {
			// yesterday format as 22:40
			yesterday.push({
				...item,
				formattedDate: new Date(item.timestamp).toLocaleString(undefined, {
					hour: 'numeric',
					minute: 'numeric',
					hour12: false,
				}),
			});
		} else if (item.timestamp >= beginningOfMonth) {
			// month, format as April 4, 08:29
			month.push({
				...item,
				formattedDate: new Date(item.timestamp).toLocaleString(undefined, {
					month: 'long',
					day: 'numeric',
					hour: 'numeric',
					minute: 'numeric',
					hour12: false,
				}),
			});
		} else if (item.timestamp >= beginningOfYear) {
			// year, format as April 4, 08:29
			year.push({
				...item,
				formattedDate: new Date(item.timestamp).toLocaleString(undefined, {
					month: 'long',
					day: 'numeric',
					hour: 'numeric',
					minute: 'numeric',
					hour12: false,
				}),
			});
		} else {
			// earlier, format as February 2, 2021, 09:14
			earlier.push({
				...item,
				formattedDate: new Date(item.timestamp).toLocaleString(undefined, {
					month: 'long',
					day: 'numeric',
					hour: 'numeric',
					minute: 'numeric',
					hour12: false,
				}),
			});
		}
	}

	let result: Array<any> = [];
	if (today.length > 0) {
		result = [...result, 'TODAY', ...today];
	}
	if (yesterday.length > 0) {
		result = [...result, 'YESTERDAY', ...yesterday];
	}
	if (month.length > 0) {
		result = [...result, 'THIS MONTH', ...month];
	}
	if (year.length > 0) {
		result = [...result, 'THIS YEAR', ...year];
	}
	if (earlier.length > 0) {
		result = [...result, 'EARLIER', ...earlier];
	}

	return result;
};
