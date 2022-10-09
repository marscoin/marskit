import actions from './actions';
import { ok, Result } from '@synonymdev/result';
import { IActivityItem } from '../types/activity';
import { getDispatch, getStore } from '../helpers';
import { onChainTransactionsToActivityItems } from '../../utils/activity';
import { getCurrentWallet } from '../../utils/wallet';

const dispatch = getDispatch();

/**
 * Adds the provided activity item to the activity list.
 * @param {IActivityItem<TActivityItems>} activityItem
 * @returns {Result<string>}
 */
export const addActivityItem = (
	activityItem: IActivityItem,
): Result<string> => {
	dispatch({
		type: actions.ADD_ACTIVITY_ITEM,
		payload: activityItem,
	});
	return ok('Activity Item Added.');
};

/**
 * Updates activity list with all wallet stores
 * @returns {Promise<Result<string>>}
 */
export const updateActivityList = (): Promise<Result<string>> => {
	return new Promise(async (resolve) => {
		await Promise.all([updateOnChainActivityList()]);

		resolve(ok('Activity items updated'));
	});
};

/**
 * Updates activity list store with just on chain wallet transactions store
 * @returns {Promise<Result<string>>}
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
	activityItems = activityItems.map((activityItem) => {
		if (activityItem.id === id) {
			return newActivityItem;
		} else {
			return activityItem;
		}
	});
	dispatch({
		type: actions.REPLACE_ACTIVITY_ITEM,
		payload: activityItems,
	});
};
