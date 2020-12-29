/**
 * Helper functions that allow for any possible bitcoin related QR to be scanned
 */

import lnd from 'react-native-lightning';
import bip21 from 'bip21';
import { ok, Result } from './result';

/**
 * Return all networks and their payment request details if found in QR data.
 * @param data
 * @returns {string}
 */
export const decodeQRData = async (data: string): Promise<Result<string[]>> => {
	let foundNetworksInQR: string[] = [];

	//Lightning URI
	if (data.indexOf('lightning:') > -1) {
		//Lightning deep link
		const lightningRes = await lnd.decodeInvoice(
			data.replace('lightning:', ''),
		);

		if (lightningRes.isOk()) {
			foundNetworksInQR.push('lightning');
		}
	}

	//Just a lightning invoice
	if (
		data.startsWith('lntb') || //Testnet
		data.startsWith('lnbc') //Mainnet
	) {
		const lightningRes = await lnd.decodeInvoice(data);

		if (lightningRes.isOk()) {
			foundNetworksInQR.push('lightning');
		}
	}

	//Bitcoin address URI
	try {
		const { address, options } = bip21.decode(data);
		console.log(options);
		if (address) {
			foundNetworksInQR.push('bitcoin');
		}

		//If a lightning invoice was passed as a param
		if (options.lightning) {
			const lightningRes = await lnd.decodeInvoice(options.lightning);

			if (lightningRes.isOk()) {
				foundNetworksInQR.push('lightning');
			}
		}
	} catch (e) {}

	//Just a bitcoin address
	let regex = new RegExp('^[13][a-km-zA-HJ-NP-Z0-9]{26,33}$');
	if (regex.test(data)) {
		foundNetworksInQR.push('bitcoin');
	}

	//TODO omni

	//TODO RGB

	return ok(foundNetworksInQR);
};
