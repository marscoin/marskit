import {
	IBuyChannelRequest,
	IBuyChannelResponse,
	IGetInfoResponse,
} from './types';
import { err, ok, Result } from '../result';

class ChainReactor {
	static host = 'http://35.233.47.252:443/chainreactor/v1/';

	setHost(newHost: string) {
		ChainReactor.host = newHost;
	}

	async call<T, Req>(
		path: string,
		method: 'GET' | 'POST',
		request?: Req,
	): Promise<T> {
		const url = `${ChainReactor.host}${path}`;

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
			return ok(res);
		} catch (e) {
			return err(e);
		}
	}

	async getOrder(orderId: string): Promise<Result<any>> {
		try {
			const res: any = await this.call(
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
