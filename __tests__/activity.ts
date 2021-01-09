import {
	updateLightingActivityList,
	updateOnChainActivityList,
	updateSearchFilter,
	updateTypesFilter,
} from '../src/store/actions/activity';
import { lnrpc } from 'react-native-lightning/dist/rpc';
import { getDispatch, getStore } from '../src/store/helpers';
import { EActivityTypes } from '../src/store/types/activity';
import { IFormattedTransaction } from '../src/store/types/wallet';
import actions from '../src/store/actions/actions';
import { createWallet } from '../src/store/actions/wallet';

const getCreationDate = (): number => Math.round(new Date().getTime() / 1000);

const addInvoiceToStore = async (invoice: lnrpc.IInvoice): Promise<void> => {
	await getDispatch()({
		type: actions.UPDATE_LIGHTNING_INVOICES,
		payload: lnrpc.ListInvoiceResponse.create({ invoices: [invoice] }),
	});
	await updateLightingActivityList();
};

const addPaymentToStore = async (payment: lnrpc.IPayment): Promise<void> => {
	await getDispatch()({
		type: actions.UPDATE_LIGHTNING_PAYMENTS,
		payload: lnrpc.ListPaymentsResponse.create({ payments: [payment] }),
	});
	await updateLightingActivityList();
};

const addOnChainTransactionToStore = async (
	transactions: IFormattedTransaction,
): Promise<void> => {
	const payload = {
		transactions,
		selectedNetwork: 'bitcoinTestnet',
		selectedWallet: 'wallet0',
	};

	await getDispatch()({
		type: actions.UPDATE_TRANSACTIONS,
		payload,
	});
	await updateOnChainActivityList();
};

describe('activity redux store', () => {
	beforeAll(async () => {
		await createWallet({});
	});

	it('should reflect the same number of activity items after updating an invoice with the same rHash', async () => {
		const inv: lnrpc.IInvoice = {
			memo: 'Made up invoice',
			rHash: new Uint8Array([1, 2, 3, 4, 5]),
			value: 999,
			settled: false,
			creationDate: getCreationDate(),
		};

		await addInvoiceToStore(inv);

		expect(getStore().activity.items.length).toEqual(1);

		inv.settled = true;

		await addInvoiceToStore(inv);
		expect(getStore().activity.items.length).toEqual(1);
	});

	it('should reflect the one more activity items after updating with an invoice with a different rHash', async () => {
		const inv: lnrpc.IInvoice = {
			memo: 'Made up invoice 2',
			rHash: new Uint8Array([2, 3, 4, 5, 6]),
			value: 999,
			settled: false,
			creationDate: getCreationDate(),
		};

		await addInvoiceToStore(inv);

		expect(getStore().activity.items.length).toEqual(2);
	});

	it('should reflect the same number of activity items after updating a payment with the same payment hash', async () => {
		const payment: lnrpc.IPayment = {
			paymentHash: 'hashbrown123',
			paymentRequest: 'blabla',
			value: 123,
			fee: 1,
			status: 1,
			creationDate: getCreationDate(),
		};

		await addPaymentToStore(payment);

		expect(getStore().activity.items.length).toEqual(3);

		payment.status = 2;
		await addPaymentToStore(payment);

		expect(getStore().activity.items.length).toEqual(3);
	});

	it('should reflect the one more activity items after updating with a payment with a different paymentHash', async () => {
		const payment: lnrpc.IPayment = {
			paymentHash: 'new-hashbrown123',
			paymentRequest: 'blabla',
			value: 234,
			fee: 2,
			status: 1,
			creationDate: getCreationDate(),
		};

		await addPaymentToStore(payment);

		expect(getStore().activity.items.length).toEqual(4);
	});

	it('should have return a filtered list when a search string is set', async () => {
		await updateSearchFilter('Made up');

		expect(getStore().activity.items.length).toEqual(4);
		expect(getStore().activity.itemsFiltered.length).toEqual(2);
	});

	it('should have return a filtered list with just lightning invoices', async () => {
		await updateTypesFilter([EActivityTypes.lightning]);
		expect(getStore().activity.itemsFiltered.length).toEqual(2);

		//Clear filters
		await updateSearchFilter('');
		await updateTypesFilter([]);
		expect(getStore().activity.itemsFiltered.length).toEqual(4);
	});

	it('should have return a filtered list with 2 types', async () => {
		let transactions: IFormattedTransaction = {
			test123: {
				address: 'string',
				height: 1,
				scriptHash: 'string',
				totalInputValue: 1,
				matchedInputValue: 1,
				totalOutputValue: 1,
				matchedOutputValue: 1,
				fee: 1,
				type: 'sent',
				value: 123,
				txid: 'string',
				messages: [],
				timestamp: 1610122180000,
			},
		};

		await addOnChainTransactionToStore(transactions);

		await updateTypesFilter([EActivityTypes.onChain]);
		expect(getStore().activity.itemsFiltered.length).toEqual(1);

		await updateTypesFilter([]);
		expect(getStore().activity.itemsFiltered.length).toEqual(5);

		await updateSearchFilter('');
	});
});
