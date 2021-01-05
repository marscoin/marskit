import {
	updateLightningInvoice,
	updateLightningPayment,
} from '../src/store/actions/activity';
import { lnrpc } from 'react-native-lightning/dist/rpc';
import { getStore } from '../src/store/helpers';

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

		await updateLightningPayment(payment, 'Test description');

		expect(getStore().activity.items.length).toEqual(3);

		payment.status = 2;
		await updateLightningPayment(payment, 'Test description');

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

		await updateLightningPayment(payment, 'Test description');

		expect(getStore().activity.items.length).toEqual(4);
	});
});
