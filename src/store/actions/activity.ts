import actions from './actions';
import { err, ok, Result } from '../../utils/result';
import { IActivityItem } from '../types/activity';
import { getDispatch } from '../helpers';
import { lnrpc } from 'react-native-lightning/dist/rpc';
import lnd from 'react-native-lightning';
import {
	lightningInvoiceToActivityItem,
	lightningPaymentToActivityItem,
} from '../../utils/activity';

const dispatch = getDispatch();

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
