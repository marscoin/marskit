import actions from './actions';
import { ok, Result } from '../../utils/result';
import { EActivityTypes, IActivityItem } from '../types/activity';
import { getDispatch, getStore } from '../helpers';
import { onChainTransactionsToActivityItems } from '../../utils/activity';
import { getCurrentWallet } from '../../utils/wallet';

const dispatch = getDispatch();

/**
 * Filter activity items with a search string
 * @param search
 * @returns {Promise<Ok<string> | Err<string>>}
 */
export const updateSearchFilter = (search: string): Promise<Result<string>> => {
	return new Promise(async (resolve) => {
		await dispatch({
			type: actions.UPDATE_ACTIVITY_SEARCH_FILTER,
			payload: search,
		});

		resolve(ok('Search filter updated'));
	});
};

/**
 * Filter activity items by returning only certain types
 * @param types
 * @returns {Promise<Ok<string> | Err<string>>}
 */
export const updateTypesFilter = (
	types: EActivityTypes[],
): Promise<Result<string>> => {
	return new Promise(async (resolve) => {
		await dispatch({
			type: actions.UPDATE_ACTIVITY_TYPES_FILTER,
			payload: types,
		});

		resolve(ok('Search filter updated'));
	});
};

/**
 * Updates activity list with all wallet stores
 * @returns {Promise<Ok<string> | Err<string>>}
 */
export const updateActivityList = (): Promise<Result<string>> => {
	return new Promise(async (resolve) => {
		await Promise.all([updateOnChainActivityList()]);

		resolve(ok('Activity items updated'));
	});
};

/**
 * Updates activity list store with just on chain wallet transactions store
 * @returns {Promise<Ok<string> | Err<string>>}
 */
export const updateOnChainActivityList = (): Promise<Result<string>> => {
	return new Promise(async (resolve) => {
		const { selectedWallet, selectedNetwork } = getCurrentWallet({});
		if (!getStore().wallet.wallets[selectedWallet]) {
			console.warn(
				'No wallet found. Cannot update activity list with transactions.',
			);
			return resolve(ok(''));
		}

		await dispatch({
			type: actions.UPDATE_ACTIVITY_ENTRIES,
			payload: onChainTransactionsToActivityItems(
				getStore().wallet.wallets[selectedWallet].transactions[selectedNetwork],
			),
		});

		resolve(ok('On chain transaction activity items updated'));
	});
};

/*
 * This resets the activity store to defaultActivityShape
 */
export const resetActivityStore = (): Result<string> => {
	dispatch({
		type: actions.RESET_ACTIVITY_STORE,
	});
	return ok('');
};

/**
 * @param {string} id
 * @param {IActivityItem} newActivityItem
 * @param {IActivityItem[]} activityItems
 */
export const replaceActivityItemById = ({
	id,
	newActivityItem,
	activityItems,
}: {
	id: string;
	newActivityItem: IActivityItem;
	activityItems?: IActivityItem[];
}): void => {
	if (!activityItems) {
		activityItems = getStore().activity.items;
	}
	activityItems = activityItems.filter(
		(activityItem) => activityItem.id !== id,
	);
	activityItems.push(newActivityItem);
	dispatch({
		type: actions.REPLACE_ACTIVITY_ITEM,
		payload: activityItems,
	});
};
