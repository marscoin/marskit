import {
	IBuyChannelRequest,
	IBuyChannelResponse,
	IGetInfoResponse,
	IGetOrderResponse,
} from './types';
import { err, ok, Result } from '../result';

class ChainReactor {
	private host = '';

	constructor() {
		this.setNetwork('regtest');
	}

	setNetwork(network: 'mainnet' | 'testnet' | 'regtest') {
		switch (network) {
			case 'mainnet': {
				this.host = '';
				break;
			}
			case 'testnet': {
				this.host = '';
				break;
			}
			case 'regtest': {
				this.host = 'http://35.233.47.252:443/chainreactor/v1/';
			}
		}
	}

	async call<T, Req>(
		path: string,
		method: 'GET' | 'POST',
		request?: Req,
	): Promise<T> {
		const url = `${this.host}${path}`;

		const fetchRes = await fetch(url, {
			method,
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
			body: request ? JSON.stringify(request) : undefined,
		});

		if (fetchRes.status !== 200) {
			throw new Error(`HTTP error ${fetchRes.status}`);
		}
		const body = await fetchRes.json();

		if (!body) {
			throw new Error('Unknown HTTP error');
		}

		if (body.error) {
			throw new Error(body.error);
		}

		return body as T;
	}

	async getInfo(): Promise<Result<IGetInfoResponse>> {
		try {
			const res = <IGetInfoResponse>await this.call('node/info', 'GET');

			//Adds a product name for display
			res.services.forEach((s) => {
				s.product_name = `Product ${s.product_id}`;
				switch (s.product_id) {
					case '60eed21d3db8ba8ac85c7322': {
						s.product_name = 'Lightning Channel';
					}
				}
			});

			return ok(res);
		} catch (e) {
			return err(e);
		}
	}

	async buyChannel(
		req: IBuyChannelRequest,
	): Promise<Result<IBuyChannelResponse>> {
		try {
			const res: IBuyChannelResponse = await this.call(
				'channel/buy',
				'POST',
				req,
			);

			res.price = Number(res.price);

			return ok(res);
		} catch (e) {
			return err(e);
		}
	}

	async getOrder(orderId: string): Promise<Result<IGetOrderResponse>> {
		try {
			const res: IGetOrderResponse = await this.call(
				`channel/order?order_id=${orderId}`,
				'GET',
			);
			return ok(res);
		} catch (e) {
			return err(e);
		}
	}
}

const cr = new ChainReactor();

export default cr;
