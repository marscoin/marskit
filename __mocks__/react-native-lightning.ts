import { err, ok, Result } from 'react-native-lightning/dist/result';
import { lnrpc } from 'react-native-lightning/dist/rpc';

class LND {
	constructor() {}

	async decodeInvoice(invoice: string): Promise<Result<lnrpc.PayReq, Error>> {
		if (!invoice.startsWith('lntb') && !invoice.startsWith('lnbc')) {
			return err(new Error('Invalid invoice format'));
		}

		try {
			const message = lnrpc.PayReqString.create();
			message.payReq = invoice;
			return ok(lnrpc.PayReq.create());
		} catch (e) {
			return err(e);
		}
	}
}

export default new LND();
