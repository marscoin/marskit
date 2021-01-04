import actions from './actions';
import { err, ok, Result } from '../../utils/result';
import { EActivityTypes, IActivityItem } from '../types/activity';
import { getDispatch } from '../helpers';
import { lnrpc } from 'react-native-lightning/dist/rpc';
import lnd from 'react-native-lightning';

const dispatch = getDispatch();

/**
 * Converts lightning invoice to activity item
 * @param rHash
 * @param settled
 * @param value
 * @param memo
 * @returns {{fee: number, description: string, id: string, type: EActivityTypes, confirmed: boolean, value: number}}
 */
const lightningInvoiceToActivityItem = ({
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
 * Updates or adds activity entries. If ID and type exists already then only the content will be updated.
 * @returns {Promise<Ok<string> | Err<string>>}
 */
// export const refreshAllActivityEntries = (): Promise<Result<string>> => {
// 	return new Promise(async (resolve) => {
// 		await refreshLightningInvoices();
//
// 		resolve(ok('Activity entries updated'));
// 	});
// };

/**
 * Adds/Updates all activity entries for lightning payments.
 * @param payments
 * @returns {Promise<Ok<string> | Err<string>>}
 */
export const refreshLightningPayments = (): Promise<Result<string>> => {
	return new Promise(async (resolve) => {
		const res = await lnd.listPayments();
		if (res.isErr()) {
			return resolve(err(res.error));
		}

		let entries: IActivityItem[] = [];
		res.value.payments.forEach(({ paymentHash, value, creationDate, fee }) => {
			if (!paymentHash) {
				return;
			}

			entries.push({
				id: paymentHash,
				type: EActivityTypes.lightningPayment,
				confirmed: true,
				value: Number(value),
				fee: Number(fee),
				description: 'todo todo',
				timestampUtc: Number(creationDate),
			});
		});

		// await dispatch({
		// 	type: actions.UPDATE_ACTIVITY_ENTRIES,
		// 	payload: entries,
		// });
		resolve(ok('Activity lightning payment entries updated'));
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
		resolve(ok('Activity entries updated'));
	});
};

/**
 * Adds all activity entries for lightning payments.
 * @returns {Promise<Ok<string> | Err<string>>}
 */
export const refreshLightningInvoices = (): Promise<Result<string>> => {
	return new Promise(async (resolve) => {
		const res = await lnd.listInvoices();
		if (res.isErr()) {
			return resolve(err(res.error));
		}

		let entries: IActivityItem[] = [];
		res.value.invoices.forEach((invoice) => {
			entries.push(lightningInvoiceToActivityItem(invoice));
		});

		await dispatch({
			type: actions.UPDATE_ACTIVITY_ENTRIES,
			payload: entries,
		});
		resolve(ok('Activity lightning invoice entries updated'));
	});
};
