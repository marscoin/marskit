import { err, ok, Result } from '@synonymdev/react-native-lightning/dist/utils/result';
import { lnrpc } from '@synonymdev/react-native-lightning/dist/protos/rpc';

class LND {
	constructor() {}

	async decodeInvoice(invoice: string): Promise<Result<lnrpc.PayReq>> {
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

	async exportAllChannelBackups(): Promise<Result<string>> {
		return ok("fake-static-channel-backup")
	}
}

import LndConf from '@synonymdev/react-native-lightning/dist/utils/lnd.conf';

export { LndConf };
export * from '@synonymdev/react-native-lightning/dist/utils/types';
export * from '@synonymdev/react-native-lightning/dist/protos/rpc';
export * from '@synonymdev/react-native-lightning/dist/protos/stateservice';
export * from '@synonymdev/react-native-lightning/dist/utils/result';

export default new LND();

