/**
 * Helper functions that allow for any possible bitcoin related QR to be scanned
 */

import lnd from 'react-native-lightning';
import bip21 from 'bip21';
import { ok, Result } from './result';
import {
	availableNetworks,
	EAvailableNetworks,
	networks,
	TAvailableNetworks,
} from './networks';
import { address as bitcoinAddress } from 'bitcoinjs-lib';
import { default as bitcoinUnits } from 'bitcoin-units';

const availableNetworksList = availableNetworks();

const validateAddress = ({
	address = '',
	selectedNetwork = undefined,
}: {
	address: string;
	selectedNetwork: TAvailableNetworks | undefined;
}): {
	isValid: boolean;
	network: TAvailableNetworks | undefined;
} => {
	try {
		//Validate address for a specific network
		if (selectedNetwork !== undefined) {
			bitcoinAddress.toOutputScript(address, networks[selectedNetwork]);
		} else {
			//Validate address for all available networks
			let isValid = false;
			let network: TAvailableNetworks | undefined;
			for (let i = 0; i < availableNetworksList.length; i++) {
				if (
					validateAddress({
						address,
						selectedNetwork: availableNetworksList[i],
					}).isValid
				) {
					isValid = true;
					network = availableNetworksList[i];
					break;
				}
			}
			return { isValid, network };
		}

		return { isValid: true, network: selectedNetwork };
	} catch (e) {
		return { isValid: false, network: selectedNetwork };
	}
};

export enum EQRDataType {
	bitcoinAddress = 'bitcoinAddress',
	lightningPaymentRequest = 'lightningPaymentRequest',
	//TODO add omni, rgb, xpub, lightning node peer etc
}

interface QRData {
	network: TAvailableNetworks;
	qrDataType: EQRDataType;
	sats?: number | Long;
	address?: string;
	invoice?: string;
	label?: string;
	message?: string;
}

/**
 * Return all networks and their payment request details if found in QR data.
 * @param data
 * @returns {string}
 */
export const decodeQRData = async (data: string): Promise<Result<QRData[]>> => {
	let foundNetworksInQR: QRData[] = [];
	let lightningInvoice = '';

	//Lightning URI or plain lightning payment request
	if (
		data.indexOf('lightning:') > -1 ||
		data.startsWith('lntb') ||
		data.startsWith('lnbc')
	) {
		//If it's a lightning URI
		let invoice = data.replace('lightning:', '');

		//Ignore params if there are any, all details can be derived from invoice
		if (invoice.indexOf('?') > -1) {
			invoice = invoice.split('?')[0];
		}

		lightningInvoice = invoice;
	}

	//Bitcoin address URI
	try {
		const { address, options } = bip21.decode(data);
		const res = validateAddress({ address, selectedNetwork: undefined });
		if (res.isValid) {
			foundNetworksInQR.push({
				qrDataType: EQRDataType.bitcoinAddress,
				network: res.network ?? 'bitcoin',
				sats: options.amount
					? bitcoinUnits(options.amount, 'bitcoin').to('sats').value()
					: undefined,
				label: options.label,
				message: options.message,
			});
		}

		//If a lightning invoice was passed as a param
		if (options.lightning) {
			lightningInvoice = options.lightning;
		}
	} catch (e) {}

	//Plain bitcoin address
	const res = validateAddress({ address: data, selectedNetwork: undefined });
	if (res.isValid) {
		foundNetworksInQR.push({
			qrDataType: EQRDataType.bitcoinAddress,
			network: res.network ?? 'bitcoin', //Should never be undefined if isValid
		});
	}

	if (lightningInvoice) {
		const lightningRes = await lnd.decodeInvoice(lightningInvoice);

		if (lightningRes.isOk()) {
			const { numSatoshis, description } = lightningRes.value;
			foundNetworksInQR.push({
				invoice: lightningInvoice,
				network: lightningInvoice.startsWith('lntb')
					? EAvailableNetworks.bitcoinTestnet
					: EAvailableNetworks.bitcoin,
				sats: Number(numSatoshis),
				qrDataType: EQRDataType.lightningPaymentRequest,
				message: description,
			});
		}
	}

	//TODO omni

	return ok(foundNetworksInQR);
};
