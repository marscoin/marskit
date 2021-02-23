import { err, ok, Result } from 'react-native-lightning/src/result';
import { lnrpc } from 'react-native-lightning/src/rpc';

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

import LndConf from 'react-native-lightning/src/lnd.conf';

export { LndConf };
export * from 'react-native-lightning/src/types';
export * from 'react-native-lightning/src/rpc';
export * from 'react-native-lightning/src/result';

export default new LND();

