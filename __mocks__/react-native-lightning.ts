import { err, ok, Result } from 'react-native-lightning/src/lightning/result';
import { lnrpc } from 'react-native-lightning/src/lightning/rpc';

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

import LndConf from 'react-native-lightning/src/lightning/lnd.conf';

export { LndConf };
export * from 'react-native-lightning/src/lightning/types';
export * from 'react-native-lightning/src/lightning/rpc';

export default new LND();

