/**
 * Helper functions that allow for any possible bitcoin related QR to be scanned
 */

import lnd from 'react-native-lightning';
import bip21 from 'bip21';
import { err, ok, Result } from './result';
import {
	availableNetworks,
	EAvailableNetworks,
	networks,
	TAvailableNetworks,
} from './networks';
import { address as bitcoinJSAddress } from 'bitcoinjs-lib';
import { parseOnChainPaymentRequest } from './wallet/transactions';
import { IOmniboltConnectData } from '../store/types/omnibolt';
import { parseOmniboltConnectData } from './omnibolt';
import { getStore } from '../store/helpers';
import { getSelectedNetwork, getSelectedWallet } from './wallet';
import { getLNURLParams } from './lnurl';
import { LNURLAuthParams, LNURLWithdrawParams } from 'js-lnurl';

const availableNetworksList = availableNetworks();

export const validateAddress = ({
	address = '',
	selectedNetwork = undefined,
}: {
	address: string;
	selectedNetwork?: TAvailableNetworks | undefined;
}): {
	isValid: boolean;
	network: TAvailableNetworks;
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
			if (!network) {
				network = 'bitcoin';
			}
			return { isValid, network };
		}

		return { isValid: true, network: selectedNetwork };
	} catch (e) {
		return { isValid: false, network: 'bitcoin' };
	}
};

export enum EQRDataType {
	bitcoinAddress = 'bitcoinAddress',
	lightningPaymentRequest = 'lightningPaymentRequest',
	omniboltConnect = 'omniboltConnect',
	lnurlAuth = 'lnurlAuth',
	lnurlWithdraw = 'lnurlWithdraw',
	//TODO add rgb, xpub, lightning node peer etc
}

export interface QRData extends IOmniboltConnectData {
	network: TAvailableNetworks;
	qrDataType: EQRDataType;
	sats?: number;
	address?: string;
	lightningPaymentRequest?: string;
	message?: string;
	lnUrlParams?: LNURLWithdrawParams | LNURLAuthParams;
}

/**
 * Return all networks and their payment request details if found in QR data.
 * Can also be used to read clipboard data for any addresses or payment requests.
 * @param data
 * @returns {string}
 */
export const decodeQRData = async (data: string): Promise<Result<QRData[]>> => {
	let foundNetworksInQR: QRData[] = [];
	let lightningInvoice = '';

	//Lightning URI or plain lightning payment request
	if (
		data.toLowerCase().indexOf('lightning:') > -1 ||
		data.toLowerCase().startsWith('lntb') ||
		data.toLowerCase().startsWith('lnbc') ||
		data.toLowerCase().startsWith('lnurl')
	) {
		//If it's a lightning URI
		let invoice = data.replace('lightning:', '').toLowerCase();

		if (data.startsWith('lnurl')) {
			//LNURL-auth
			const res = await getLNURLParams(data);
			if (res.isErr()) {
				return err(res.error);
			}

			const qrDataType =
				res.value.tag === 'login'
					? EQRDataType.lnurlAuth
					: res.value.tag === 'withdrawRequest'
					? EQRDataType.lnurlWithdraw
					: null;

			if (qrDataType) {
				foundNetworksInQR.push({
					qrDataType,
					//No real difference between networks for lnurl, all keys are derived the same way so assuming current network
					network: getStore().wallet.selectedNetwork,
					lnUrlParams: res.value,
				});
			}
		} else {
			//Assume invoice
			//Ignore params if there are any, all details can be derived from invoice
			if (invoice.indexOf('?') > -1) {
				invoice = invoice.split('?')[0];
			}

			lightningInvoice = invoice;
		}
	}

	//Plain bitcoin address or Bitcoin address URI
	try {
		const onChainParseResponse = parseOnChainPaymentRequest(data);
		if (onChainParseResponse.isOk()) {
			const { address, sats, message, network } = onChainParseResponse.value;
			foundNetworksInQR.push({
				qrDataType: EQRDataType.bitcoinAddress,
				address,
				network,
				sats,
				message,
			});
		}

		const { options } = bip21.decode(data);

		//If a lightning invoice was passed as a param
		if (options.lightning) {
			lightningInvoice = options.lightning;
		}
	} catch (e) {}

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

	// If we've found any of the above bitcoin QR data don't decode for other networks
	if (foundNetworksInQR.length > 0) {
		return ok(foundNetworksInQR);
	}

	//Omnibolt connect request
	try {
		const omniboltConnectResponse = await parseOmniboltConnectData(data);
		if (omniboltConnectResponse.isOk()) {
			const selectedWallet = getSelectedWallet();
			const selectedNetwork = getSelectedNetwork();
			const omniboltNetwork =
				getStore().omnibolt.wallets[selectedWallet].userData[selectedNetwork]
					.chainNodeType === 'test'
					? EAvailableNetworks.bitcoinTestnet
					: EAvailableNetworks.bitcoin;
			foundNetworksInQR.push({
				qrDataType: EQRDataType.omniboltConnect,
				network: omniboltNetwork,
				...omniboltConnectResponse.value,
			});
		}
	} catch {}

	return ok(foundNetworksInQR);
};
