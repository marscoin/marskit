import { err, ok, Result } from 'react-native-lightning/dist/result';
import { lnrpc } from 'react-native-lightning/dist/rpc';

class LND {
	constructor() {}

	async decodeInvoice(invoice: string): Promise<Result<lnrpc.PayReq, Error>> {
		try {
			const message = lnrpc.PayReqString.create();
			message.payReq = invoice;
			return ok(
				lnrpc.PayReq.create({
					description: 'Dummy description',
					numSatoshis: 123,
				}),
			);
		} catch (e) {
			return err(e);
		}
	}
}

export default new LND();
