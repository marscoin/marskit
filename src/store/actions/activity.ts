import actions from './actions';
import { ok, Result } from '../../utils/result';
import { EActivityTypes, IActivityItem } from '../types/activity';
import { getDispatch, getStore } from '../helpers';
import lnd from 'react-native-lightning';
import {
	lightningInvoiceToActivityItem,
	lightningPaymentToActivityItem,
	onChainTransactionsToActivityItems,
} from '../../utils/activity';
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
		await Promise.all([
			updateLightingActivityList(),
			updateOnChainActivityList(),
		]);

		resolve(ok('Activity items updated'));
	});
};

/**
 * Updates activity list store with just lightning invoices and payments stores
 * @returns {Promise<Ok<string> | Err<string>>}
 */
export const updateLightingActivityList = (): Promise<Result<string>> => {
	return new Promise(async (resolve) => {
		resolve(ok('Lightning transactions activity items updated'));
		//TODO remove

		//Add all invoices
		let entries: IActivityItem[] = [];
		getStore().lightning.invoiceList.invoices.forEach((invoice) =>
			entries.push(lightningInvoiceToActivityItem(invoice)),
		);

		const paymentsList = getStore().lightning.paymentList;
		for (let index = 0; index < paymentsList.payments.length; index++) {
			//Payment description isn't returned in the response so we need to decode the original payment request
			//If this becomes slow we should consider caching these in another store
			const payment = paymentsList.payments[index];
			const decodedPayment = await lnd.decodeInvoice(
				payment.paymentRequest ?? '',
			);

			entries.push(
				lightningPaymentToActivityItem(
					payment,
					decodedPayment.isOk() ? decodedPayment.value.description : '',
				),
			);
		}

		await dispatch({
			type: actions.UPDATE_ACTIVITY_ENTRIES,
			payload: entries,
		});

		resolve(ok('Lightning transactions activity items updated'));
	});
};

/**
 * Updates activity list store with just on chain wallet transactions store
 * @returns {Promise<Ok<string> | Err<string>>}
 */
export const updateOnChainActivityList = (): Promise<Result<string>> => {
	return new Promise(async (resolve) => {
		// return resolve(ok('')); //TODO remove

		const { selectedWallet, selectedNetwork } = getCurrentWallet({});
		if (!getStore().wallet.wallets[selectedWallet]) {
			//TODO figure out why this may be happening
			console.warn('No wallet found. Cannot update activity list.');
			return resolve(ok(''));
		}

		console.log(
			getStore().wallet.wallets[selectedWallet].transactions[selectedNetwork],
		);

		await dispatch({
			type: actions.UPDATE_ACTIVITY_ENTRIES,
			payload: onChainTransactionsToActivityItems(
				getStore().wallet.wallets[selectedWallet].transactions[selectedNetwork],
			),
		});

		resolve(ok('On chain transaction activity items updated'));
	});
};
