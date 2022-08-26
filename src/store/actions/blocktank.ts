import actions from './actions';
import { err, ok, Result } from '@synonymdev/result';
import { getDispatch, getStore } from '../helpers';
import {
	IBuyChannelRequest,
	IBuyChannelResponse,
	IFinalizeChannelResponse,
} from '@synonymdev/blocktank-client';
import * as blocktank from '../../utils/blocktank';
import { setupOnChainTransaction, updateOnChainTransaction } from './wallet';
import {
	getBalance,
	getSelectedNetwork,
	getSelectedWallet,
} from '../../utils/wallet';
import { EAvailableNetworks, TAvailableNetworks } from '../../utils/networks';
import { sleep } from '../../utils/helpers';
import {
	broadcastTransaction,
	createTransaction,
	updateFee,
} from '../../utils/wallet/transactions';
import { getNodeId } from '../../utils/lightning';

const dispatch = getDispatch();

/**
 * Refreshes available services from BLocktank.
 * @returns {Promise<Result<string>>}
 */
export const refreshServiceList = async (): Promise<Result<string>> => {
	try {
		const services = await blocktank.getAvailableServices();
		if (services.isErr()) {
			return err(services.error.message);
		}

		dispatch({
			type: actions.UPDATE_BLOCKTANK_SERVICE_LIST,
			payload: services.value,
		});

		return ok('Product list updated');
	} catch (e) {
		return err(e);
	}
};

/**
 * Attempts to buy a channel from BLocktank and updates the saved order id information.
 * @param {IBuyChannelRequest} req
 * @returns {Promise<Result<IBuyChannelResponse>>}
 */
export const buyChannel = async (
	req: IBuyChannelRequest,
): Promise<Result<IBuyChannelResponse>> => {
	try {
		const res = await blocktank.buyChannel(req);
		if (res.isErr()) {
			return err(res.error.message);
		}

		if (res.value?.order_id) {
			//Fetches and updates the user's order list
			await refreshOrder(res.value.order_id);
		} else {
			return err('Unable to find order id.');
		}

		return ok(res.value);
	} catch (error) {
		return err(error);
	}
};

/**
 * Refreshes a given orderId.
 * @param {string} orderId
 * @returns {Promise<Result<string>>}
 */
export const refreshOrder = async (
	orderId: string,
): Promise<Result<string>> => {
	try {
		const res = await blocktank.getOrder(orderId);
		if (res.isErr()) {
			return err(res.error.message);
		}

		dispatch({
			type: actions.UPDATE_BLOCKTANK_ORDER,
			payload: res.value,
		});

		return ok('Order updated');
	} catch (error) {
		return err(error);
	}
};

/*
 * This resets the activity store to defaultActivityShape
 * @returns {Result<string>}
 */
export const resetBlocktankStore = (): Result<string> => {
	dispatch({
		type: actions.RESET_BLOCKTANK_STORE,
	});
	return ok('');
};

// TODO: This is for DEV testing purposes on regtest only. Remove upon release.
/**
 * Attempts to auto-buy a channel from Blocktank while on regtest.
 * @param {TAvailableNetworks} [selectedNetwork]
 * @param {string} [selectedWallet]
 * @param {number} [inboundLiquidity]
 * @param {number} [outboundLiquidity]
 * @param {number} [channelExpiry]
 * @returns {Promise<Result<IFinalizeChannelResponse>>}
 */
export const autoBuyChannel = async ({
	selectedNetwork,
	selectedWallet,
	inboundLiquidity = 100000, //Inbound liquidity. How much will be on Blocktank.
	outboundLiquidity = 0, //Outbound liquidity. How much will get pushed to the app
	channelExpiry = 12,
}: {
	selectedNetwork?: TAvailableNetworks;
	selectedWallet?: string;
	inboundLiquidity?: number;
	outboundLiquidity?: number;
	channelExpiry?: number;
}): Promise<Result<IFinalizeChannelResponse>> => {
	if (!selectedNetwork) {
		selectedNetwork = getSelectedNetwork();
	}
	if (!selectedWallet) {
		selectedWallet = getSelectedWallet();
	}
	if (selectedNetwork !== EAvailableNetworks.bitcoinRegtest) {
		return err('This method is only allowed on regtest.');
	}
	const nodeId = await getNodeId();
	console.log('Nodeid', nodeId);
	if (nodeId.isErr()) {
		return err(nodeId.error.message);
	}

	const { satoshis } = getBalance({ onchain: true, selectedNetwork });
	if (!satoshis || satoshis < 2000) {
		return err('Please send at least 2000 satoshis to your wallet.');
	}
	const product_id = getStore().blocktank.serviceList[0].product_id;
	console.log('Product ID:', product_id);
	/*const remote_balance =
		getStore().blocktank.serviceList[0].min_channel_size * 4;
	const local_balance =
		getStore().blocktank.serviceList[0].min_channel_size * 4;*/
	const buyChannelData = {
		product_id,
		remote_balance: outboundLiquidity,
		local_balance: inboundLiquidity,
		channel_expiry: channelExpiry,
	};
	const buyChannelResponse = await buyChannel(buyChannelData);
	console.log('buyChannelResponse:', buyChannelResponse);
	if (buyChannelResponse.isErr()) {
		return err(buyChannelResponse.error.message);
	}
	await setupOnChainTransaction({ rbf: false });
	await updateOnChainTransaction({
		transaction: {
			outputs: [
				{
					value: buyChannelResponse.value.price,
					index: 0,
					address: buyChannelResponse.value.btc_address,
				},
			],
		},
	});
	await updateFee({ satsPerByte: 4, selectedNetwork });
	console.log('Creating Transaction...');
	const rawTx = await createTransaction({ selectedNetwork });
	console.log('rawTx:', rawTx);
	if (rawTx.isErr()) {
		return err(rawTx.error.message);
	}
	console.log('Broadcastion Transaction...');
	const broadcastResponse = await broadcastTransaction({
		rawTx: rawTx.value.hex,
		selectedNetwork,
	});
	console.log('broadcastResponse: ', broadcastResponse);
	if (broadcastResponse.isErr()) {
		return err(broadcastResponse.error.message);
	}
	let paymentReceived = false;
	let i = 1;
	while (!paymentReceived && i <= 60) {
		const orderStatus = await blocktank.getOrder(
			buyChannelResponse.value.order_id,
		);
		console.log(`orderStatus check (${i}/60): `, orderStatus);
		if (orderStatus.isErr()) {
			return err(orderStatus.error.message);
		}
		if (orderStatus.value.state === 100) {
			paymentReceived = true;
		}
		await sleep(5000);
		i++;
	}
	if (!paymentReceived) {
		console.log('Payment not received.');
		return err('Payment not received.');
	}
	const params = {
		order_id: buyChannelResponse.value.order_id,
		node_uri: nodeId.value,
		private: true,
	};
	console.log('finalizeChannelParams', params);

	const finalizeResponse = await blocktank.finalizeChannel(params);
	console.log('finalizeResponse', finalizeResponse);
	return finalizeResponse;
};
