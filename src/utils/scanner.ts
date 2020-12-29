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
import { address as bitcoinJSAddress } from 'bitcoinjs-lib';
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
			bitcoinJSAddress.toOutputScript(address, networks[selectedNetwork]);
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
	//TODO add omni, rgb, lnurl, xpub, lightning node peer etc
}

export interface QRData {
	network: TAvailableNetworks;
	qrDataType: EQRDataType;
	sats?: number | Long;
	address?: string;
	lightningPaymentRequest?: string;
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
		let invoice = data.replace('lightning:', '').toLowerCase();

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

		let lightningData: QRData = {
			lightningPaymentRequest: lightningInvoice,
			network: lightningInvoice.startsWith('lntb')
				? EAvailableNetworks.bitcoinTestnet
				: EAvailableNetworks.bitcoin,
			qrDataType: EQRDataType.lightningPaymentRequest,
		};

		if (lightningRes.isOk()) {
			const { numSatoshis, description } = lightningRes.value;

			lightningData.sats = Number(numSatoshis);
			lightningData.message = description;
			foundNetworksInQR.push(lightningData);
		} else if (
			lightningRes.error.message.indexOf(
				'invoice not for current active network',
			) > -1
		) {
			//Still add the data even if it's not for this network. So the error can be handled in the UI for the user.
			foundNetworksInQR.push(lightningData);
		}
	}

	//TODO omni

	return ok(foundNetworksInQR);
};
