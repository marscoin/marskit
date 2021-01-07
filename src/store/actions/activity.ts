import actions from './actions';
import { err, ok, Result } from '../../utils/result';
import { EActivityTypes, IActivityItem } from '../types/activity';
import { getDispatch } from '../helpers';
import { lnrpc } from 'react-native-lightning/dist/rpc';
import lnd from 'react-native-lightning';
import {
	lightningInvoiceToActivityItem,
	lightningPaymentToActivityItem,
	onChainTransactionsToActivityItems,
} from '../../utils/activity';
import { updateTransactions } from './wallet';
import { getCurrentWallet } from '../../utils/wallet';
import { IFormattedTransaction } from '../types/wallet';
import { TAvailableNetworks } from '../../utils/networks';

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
 * Updates a single lightning payment. Requires the description because that isn't stored with the payment.
 * @param payment
 * @param description
 * @returns {Promise<Ok<string> | Err<string>>}
 */
export const updateLightningPayment = (
	payment: lnrpc.IPayment,
	description: string,
): Promise<Result<string>> => {
	return new Promise(async (resolve) => {
		await dispatch({
			type: actions.UPDATE_ACTIVITY_ENTRIES,
			payload: [lightningPaymentToActivityItem(payment, description)],
		});

		resolve(ok('Activity payment updated'));
	});
};

/**
 * Updates or appends the details for a single lightning invoice
 * @param invoice
 * @return {Promise<Ok<string> | Err<string>>}
 */
export const updateLightningInvoice = (
	invoice: lnrpc.IInvoice,
): Promise<Result<string>> => {
	return new Promise(async (resolve) => {
		await dispatch({
			type: actions.UPDATE_ACTIVITY_ENTRIES,
			payload: [lightningInvoiceToActivityItem(invoice)],
		});
		resolve(ok('Activity invoice updated'));
	});
};

/**
 * Refreshes all wallet activity
 * @returns {Promise<Ok<string> | Err<string>>}
 */
export const refreshAllActivity = (): Promise<Result<string>> => {
	return new Promise(async (resolve) => {
		await Promise.all([
			refreshAllLightningTransactions(),
			refreshAllOnChainTransactions({}),
			//TODO other wallets as we go
		]);
		resolve(ok('Activity lightning invoice entries updated'));
	});
};

/**
 * Adds all activity entries for lightning payments and invoice.
 * @returns {Promise<Ok<string> | Err<string>>}
 */
export const refreshAllLightningTransactions = (): Promise<Result<string>> => {
	return new Promise(async (resolve) => {
		const invoicesRes = await lnd.listInvoices();
		if (invoicesRes.isErr()) {
			return resolve(err(invoicesRes.error));
		}

		//Add all invoices
		let entries: IActivityItem[] = [];
		invoicesRes.value.invoices.forEach((invoice) =>
			entries.push(lightningInvoiceToActivityItem(invoice)),
		);

		//Add all payments
		const paymentsRes = await lnd.listPayments();
		if (paymentsRes.isErr()) {
			return resolve(err(paymentsRes.error));
		}

		for (let index = 0; index < paymentsRes.value.payments.length; index++) {
			//Payment description isn't returned in the response so we need to decode the original payment request
			const payment = paymentsRes.value.payments[index];
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
		resolve(ok('Activity lightning invoice entries updated'));
	});
};

/**
 * Adds all activity entries for on-chain transactions
 * @returns {Promise<Ok<string> | Err<string>>}
 */
export const refreshAllOnChainTransactions = ({
	transactions = undefined,
	selectedWallet = undefined,
	selectedNetwork = undefined,
}: {
	transactions?: IFormattedTransaction | undefined;
	selectedWallet?: string | undefined;
	selectedNetwork?: TAvailableNetworks | undefined;
}): Promise<Result<string>> => {
	return new Promise(async (resolve) => {
		let formattedTransactions = transactions;

		if (!formattedTransactions || !selectedWallet || !selectedNetwork) {
			const {
				selectedWallet: wallet,
				selectedNetwork: network,
			} = getCurrentWallet({});
			const res = await updateTransactions({
				selectedWallet: wallet,
				selectedNetwork: network,
			});

			if (res.isErr()) {
				return resolve(err(res.error));
			}

			formattedTransactions = res.value;
		}

		await dispatch({
			type: actions.UPDATE_ACTIVITY_ENTRIES,
			payload: onChainTransactionsToActivityItems(formattedTransactions!),
		});
		resolve(ok('Activity on chain transactions updated'));
	});
};
