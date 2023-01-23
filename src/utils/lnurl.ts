import {
	createChannelRequestUrl,
	createPayRequestUrl,
	createWithdrawCallbackUrl,
	lnurlAuth as lnAuth,
	LNURLAuthParams,
	LNURLChannelParams,
	LNURLPayParams,
	LNURLWithdrawParams,
} from '@synonymdev/react-native-lnurl';
import {
	showErrorNotification,
	showSuccessNotification,
} from './notifications';
import { err, ok, Result } from '@synonymdev/result';
import {
	addPeer,
	getLightningBalance,
	getNodeIdFromStorage,
	getPeersFromStorage,
} from './lightning';
import { createLightningInvoice, savePeer } from '../store/actions/lightning';
import { EQRDataType, processInputData, TProcessedData } from './scanner';
import { TWalletName } from '../store/types/wallet';
import { TAvailableNetworks } from './networks';
import {
	getMnemonicPhrase,
	getSelectedNetwork,
	getSelectedWallet,
} from './wallet';

/**
 * Handles LNURL Pay Requests.
 * @param {LNURLPayParams} params
 * @param {TWalletName} [selectedWallet]
 * @param {TAvailableNetworks} [selectedNetwork]
 * @returns {Promise<Result<TProcessedData>>}
 */
export const handleLnurlPay = async ({
	params,
	selectedWallet,
	selectedNetwork,
}: {
	params: LNURLPayParams;
	selectedWallet?: TWalletName;
	selectedNetwork?: TAvailableNetworks;
}): Promise<Result<TProcessedData>> => {
	if (!selectedWallet) {
		selectedWallet = getSelectedWallet();
	}
	if (!selectedNetwork) {
		selectedNetwork = getSelectedNetwork();
	}

	const nodeId = getNodeIdFromStorage({ selectedWallet, selectedNetwork });
	if (!nodeId) {
		const msg =
			'Unable to startup local lightning node at this time. Please try again or restart the app.';
		showErrorNotification({
			title: 'LNURL-Pay Error',
			message: msg,
		});
		return err(msg);
	}

	const milliSats = params.minSendable;

	const callbackRes = await createPayRequestUrl({
		params,
		milliSats,
		comment: 'Bitkit LNURL-Pay',
	});
	if (callbackRes.isErr()) {
		showErrorNotification({
			title: 'LNURL-Pay failed',
			message: callbackRes.error.message,
		});
		return err(callbackRes.error.message);
	}

	const invoice = callbackRes.value;

	//Now that we have the invoice, process it.
	return await processInputData({
		data: invoice,
		selectedWallet,
		selectedNetwork,
	});
};

/**
 * Handles LNURL Channel Open Requests.
 * @param {LNURLChannelParams} params
 * @param {TWalletName} [selectedWallet]
 * @param {TAvailableNetworks} [selectedNetwork]
 */
export const handleLnurlChannel = async ({
	params,
	selectedWallet,
	selectedNetwork,
}: {
	params: LNURLChannelParams;
	selectedWallet?: TWalletName;
	selectedNetwork?: TAvailableNetworks;
}): Promise<Result<TProcessedData>> => {
	if (!selectedWallet) {
		selectedWallet = getSelectedWallet();
	}
	if (!selectedNetwork) {
		selectedNetwork = getSelectedNetwork();
	}

	const peer = params.uri;
	if (peer.includes('onion')) {
		const msg = 'Unable to add tor nodes at this time.';
		showErrorNotification({
			title: 'LNURL-Channel Request Error',
			message: `Error adding lightning peer: ${msg}`,
		});
		return err(msg);
	}

	const nodeId = getNodeIdFromStorage({ selectedWallet, selectedNetwork });
	if (!nodeId) {
		const msg =
			'Unable to startup local lightning node at this time. Please try again or restart the app.';
		showErrorNotification({
			title: 'LNURL-Channel Request Error',
			message: msg,
		});
		return err(msg);
	}
	const peers = getPeersFromStorage({ selectedWallet, selectedNetwork });

	// Add this peer if we haven't already.
	if (!peers.includes(peer)) {
		const addPeerRes = await addPeer({
			peer,
			timeout: 5000,
		});
		if (addPeerRes.isErr()) {
			showErrorNotification({
				title: 'LNURL-Channel Request Error',
				message: `Error adding lightning peer: ${addPeerRes.error.message}`,
			});
			return err('Unable to add lightning peer.');
		}
		const savePeerRes = savePeer({ selectedWallet, selectedNetwork, peer });
		if (savePeerRes.isErr()) {
			showErrorNotification({
				title: 'LNURL-Channel Request Error',
				message: `Unable to save lightning peer: ${savePeerRes.error.message}`,
			});
			return err(savePeerRes.error.message);
		}
	}

	const callbackRes = await createChannelRequestUrl({
		localNodeId: nodeId,
		params,
		isPrivate: true,
		cancel: false,
	});
	if (callbackRes.isErr()) {
		showErrorNotification({
			title: 'LNURL-Channel Request failed',
			message: callbackRes.error.message,
		});
		return err(callbackRes.error.message);
	}

	const channelStatusRes = await fetch(callbackRes.value);
	if (channelStatusRes.status !== 200) {
		showErrorNotification({
			title: 'LNURL-Channel failed',
			message: 'Unable to connect to Blocktank server.',
		});
		return err('Unable to connect to Blocktank server.');
	}
	const jsonRes = await channelStatusRes.json();

	if (jsonRes.status === 'ERROR') {
		showErrorNotification({
			title: 'LNURL-Channel failed',
			message: jsonRes.reason,
		});
		return err(jsonRes.reason);
	}

	showSuccessNotification({
		title: 'Success!',
		message: peer
			? `Successfully requested channel from: ${peer}.`
			: 'Successfully requested channel.',
	});
	return ok({ type: EQRDataType.lnurlChannel });
};

/**
 * Handles LNURL Auth Requests.
 * @param {LNURLAuthParams} params
 * @param {TWalletName} [selectedWallet]
 * @param {TAvailableNetworks} [selectedNetwork]
 * @returns {Promise<Result<TProcessedData>>}
 */
export const handleLnurlAuth = async ({
	params,
	selectedWallet,
	selectedNetwork,
}: {
	params: LNURLAuthParams;
	selectedWallet?: TWalletName;
	selectedNetwork?: TAvailableNetworks;
}): Promise<Result<TProcessedData>> => {
	if (!selectedWallet) {
		selectedWallet = getSelectedWallet();
	}
	if (!selectedNetwork) {
		selectedNetwork = getSelectedNetwork();
	}

	const getMnemonicPhraseResponse = await getMnemonicPhrase(selectedWallet);
	if (getMnemonicPhraseResponse.isErr()) {
		return err(getMnemonicPhraseResponse.error.message);
	}

	const authRes = await lnAuth({
		params,
		// @ts-ignore
		network: selectedNetwork,
		bip32Mnemonic: getMnemonicPhraseResponse.value,
	});
	if (authRes.isErr()) {
		showErrorNotification({
			title: 'LNURL-Auth failed',
			message: authRes.error.message,
		});
		return err(authRes.error.message);
	}

	showSuccessNotification({
		title: 'Authenticated!',
		message: params.domain
			? `Successfully logged into: ${params.domain}.`
			: 'Successfully logged in.',
	});
	return ok({ type: EQRDataType.lnurlAuth });
};

/**
 * Handles LNURL Withdraw Requests.
 * @param {LNURLWithdrawParams} params
 * @param {TWalletName} [selectedWallet]
 * @param {TAvailableNetworks} [selectedNetwork]
 * @returns {Promise<Result<TProcessedData>>}
 */
export const handleLnurlWithdraw = async ({
	params,
	selectedWallet,
	selectedNetwork,
}: {
	params: LNURLWithdrawParams;
	selectedWallet?: TWalletName;
	selectedNetwork?: TAvailableNetworks;
}): Promise<Result<TProcessedData>> => {
	if (!selectedWallet) {
		selectedWallet = getSelectedWallet();
	}
	if (!selectedNetwork) {
		selectedNetwork = getSelectedNetwork();
	}

	const amountSats = params.maxWithdrawable / 1000; //Convert msats to sats.
	const description = params?.defaultDescription ?? '';

	// Determine if we have enough receiving capacity before proceeding.
	const lightningBalance = await getLightningBalance({
		selectedWallet,
		selectedNetwork,
		includeReserveBalance: false,
	});

	if (lightningBalance.remoteBalance < amountSats) {
		const msg =
			'Not enough inbound/receiving capacity to complete lnurl-withdraw request.';
		showErrorNotification({
			title: 'LNURL-Withdraw Error',
			message: msg,
		});
		return err(msg);
	}

	const invoice = await createLightningInvoice({
		expiryDeltaSeconds: 3600,
		amountSats,
		description,
		selectedWallet,
		selectedNetwork,
	});
	if (invoice.isErr()) {
		const msg = 'Unable to successfully create invoice for lnurl-withdraw.';
		showErrorNotification({
			title: 'LNURL-Withdraw Error',
			message: msg,
		});
		return err(msg);
	}
	const callbackRes = await createWithdrawCallbackUrl({
		params,
		paymentRequest: invoice.value.to_str,
	});
	if (callbackRes.isErr()) {
		showErrorNotification({
			title: 'LNURL-Withdraw Request failed',
			message: callbackRes.error.message,
		});
		return err(callbackRes.error.message);
	}

	const channelStatusRes = await fetch(callbackRes.value);
	if (channelStatusRes.status !== 200) {
		showErrorNotification({
			title: 'LNURL-Withdraw failed',
			message: 'Unable to connect to LNURL withdraw server.',
		});
		return err('Unable to connect to LNURL withdraw server.');
	}

	showSuccessNotification({
		title: 'Withdraw Requested',
		message: 'LNURL Withdraw was successfully requested.',
	});
	return ok({ type: EQRDataType.lnurlWithdraw });
};
