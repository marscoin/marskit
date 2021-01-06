import {
	updateLightningInvoice,
	updateLightningPayment,
	updateSearchFilter,
	updateTypesFilter,
} from '../src/store/actions/activity';
import { lnrpc } from 'react-native-lightning/dist/rpc';
import { getStore } from '../src/store/helpers';
import { EActivityTypes } from '../src/store/types/activity';

const getCreationDate = (): number => Math.round(new Date().getTime() / 1000);

describe('activity redux store', () => {
	it('should reflect the same number of activity items after updating an invoice with the same rHash', async () => {
		const inv: lnrpc.IInvoice = {
			memo: 'Made up invoice',
			rHash: new Uint8Array([1, 2, 3, 4, 5]),
			value: 999,
			settled: false,
			creationDate: getCreationDate(),
		};

		await updateLightningInvoice(inv);
		expect(getStore().activity.items.length).toEqual(1);

		inv.settled = true;

		await updateLightningInvoice(inv);
		expect(getStore().activity.items.length).toEqual(1);

		const inv2: lnrpc.IInvoice = {
			memo: 'Made up invoice 2',
			rHash: new Uint8Array([5, 4, 2, 2, 1]),
			value: 999,
			settled: false,
			creationDate: getCreationDate(),
		};

		await updateLightningInvoice(inv2);
		expect(getStore().activity.items.length).toEqual(2);
	});

	it('should reflect the one more activity items after updating with an invoice with a different rHash', async () => {
		const inv: lnrpc.IInvoice = {
			memo: 'Made up invoice',
			rHash: new Uint8Array([2, 3, 4, 5, 6]),
			value: 999,
			settled: false,
			creationDate: getCreationDate(),
		};

		await updateLightningInvoice(inv);

		expect(getStore().activity.items.length).toEqual(3);
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

		await updateLightningPayment(payment, 'Test description');

		expect(getStore().activity.items.length).toEqual(4);

		payment.status = 2;
		await updateLightningPayment(payment, 'Test description');

		expect(getStore().activity.items.length).toEqual(4);
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

		await updateLightningPayment(payment, 'Test description');

		expect(getStore().activity.items.length).toEqual(5);
	});

	it('should have return a filtered list when a search string is set', async () => {
		await updateSearchFilter('Made up');

		expect(getStore().activity.items.length).toEqual(5);
		expect(getStore().activity.itemsFiltered.length).toEqual(3);
	});

	it('should have return a filtered list with just lightning invoices', async () => {
		await updateTypesFilter([EActivityTypes.lightningPayment]);
		expect(getStore().activity.itemsFiltered.length).toEqual(0);

		//Reset search field
		await updateSearchFilter('');
		expect(getStore().activity.itemsFiltered.length).toEqual(2);
	});

	it('should have return a filtered list with 2 types', async () => {
		await updateTypesFilter([
			EActivityTypes.lightningInvoice,
			EActivityTypes.lightningPayment,
		]);
		expect(getStore().activity.itemsFiltered.length).toEqual(5);

		await updateTypesFilter([EActivityTypes.onChainReceive]);
		expect(getStore().activity.itemsFiltered.length).toEqual(0);

		await updateSearchFilter('');
	});
});
