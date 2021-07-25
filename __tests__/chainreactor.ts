import cr from '../src/utils/chainreactor';
global.fetch = require('node-fetch');

describe('chain reactor', () => {
	beforeAll(async () => {});

	it('get CR info and get invoice for first product', async () => {
		const infoRes = await cr.getInfo();

		expect(infoRes.isOk()).toBe(true);
		if (infoRes.isErr()) {
			return;
		}

		const info = infoRes.value;

		expect(info.capacity.remote_balance).not.toBeNaN();

		const service = info.services[0];

		const buyRes = await cr.buyChannel({
			product_id: service.product_id,
			channel_expiry: 4,
			remote_balance: 0,
			local_balance: 14990950,
		});

		expect(buyRes.isOk()).toBe(true);
		if (buyRes.isErr()) {
			expect(buyRes.error.message).toEqual('');
			return;
		}

		const orderRes = buyRes.value;

		expect(typeof orderRes.ln_invoice).toBe('string');

		//Check order
		const getOrderRes = await cr.getOrder(orderRes.order_id);
		expect(getOrderRes.isOk()).toBe(true);
		if (getOrderRes.isErr()) {
			expect(getOrderRes.error.message).toEqual('');
			return;
		}

		expect(getOrderRes.value.state).toBe(0);
		expect(typeof orderRes.ln_invoice).toBe('string');
	});
});
