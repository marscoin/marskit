import actions from './actions';
import { err, ok, Result } from '@synonymdev/result';
import { getDispatch, getStore } from '../helpers';
import {
	IBuyChannelRequest,
	IBuyChannelResponse,
	IFinalizeChannelResponse,
	IGetOrderResponse,
} from '@synonymdev/blocktank-client';
import * as blocktank from '../../utils/blocktank';
import { setupOnChainTransaction, updateBitcoinTransaction } from './wallet';
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
import { getNodeId, refreshLdk } from '../../utils/lightning';
import { finalizeChannel } from '../../utils/blocktank';
import { removeTodo } from './todos';

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
 * Retrieves & Updates the status of all stored orders.
 * @returns {Promise<Result<string>>}
 */
export const refreshOrdersList = async (): Promise<Result<string>> => {
	try {
		const orders = getStore().blocktank.orders;
		let ordersThatNeedUpdating: string[] = [];
		await Promise.all(
			orders.map((order) => {
				if (order.state < 410) {
					ordersThatNeedUpdating.push(order._id);
				}
			}),
		);
		await Promise.all(
			ordersThatNeedUpdating.map(async (orderId) => {
				await refreshOrder(orderId);
			}),
		);
		return ok('Orders list updated');
	} catch (e) {
		return err(e);
	}
};

/**
 * Retrieves, updates and attempts to finalize any pending channel open for a given orderId.
 * @param {string} orderId
 * @param {IGetOrderResponse} [orderResponse]
 * @returns {Promise<Result<IGetOrderResponse>>}
 */
export const refreshOrder = async (
	orderId: string,
	orderResponse?: IGetOrderResponse,
): Promise<Result<IGetOrderResponse>> => {
	try {
		if (!orderResponse) {
			const getOrderRes = await blocktank.getOrder(orderId);
			if (getOrderRes.isErr()) {
				return err(getOrderRes.error.message);
			}
			orderResponse = getOrderRes.value;

			// Attempt to finalize the channel open.
			if (getOrderRes.value.state === 100) {
				const finalizeRes = await finalizeChannel(orderId);
				if (finalizeRes.isOk()) {
					setTimeout(() => refreshLdk({}), 15000);
					await removeTodo('lightning');
					const getUpdatedOrderRes = await blocktank.getOrder(orderId);
					if (getUpdatedOrderRes.isErr()) {
						return err(getUpdatedOrderRes.error.message);
					}
					orderResponse = getUpdatedOrderRes.value;
				}
			}
		}

		const storedOrder = getStore().blocktank.orders.filter(
			(o) =>
				o._id === orderId || (orderResponse && orderResponse._id === o._id),
		);
		if (
			storedOrder.length > 0 &&
			storedOrder[0].state === orderResponse.state
		) {
			return ok(orderResponse);
		}

		dispatch({
			type: actions.UPDATE_BLOCKTANK_ORDER,
			payload: orderResponse,
		});

		return ok(orderResponse);
	} catch (error) {
		return err(error);
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

	const { satoshis } = getBalance({
		onchain: true,
		selectedNetwork,
		selectedWallet,
	});
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
	await setupOnChainTransaction({
		rbf: false,
		selectedNetwork,
		selectedWallet,
	});
	await updateBitcoinTransaction({
		transaction: {
			outputs: [
				{
					value: buyChannelResponse.value.price,
					index: 0,
					address: buyChannelResponse.value.btc_address,
				},
			],
		},
		selectedNetwork,
		selectedWallet,
	});
	await updateFee({ satsPerByte: 4, selectedNetwork, selectedWallet });
	console.log('Creating Transaction...');
	const rawTx = await createTransaction({ selectedNetwork, selectedWallet });
	console.log('rawTx:', rawTx);
	if (rawTx.isErr()) {
		return err(rawTx.error.message);
	}
	console.log('Broadcastion Transaction...');
	const broadcastResponse = await broadcastTransaction({
		rawTx: rawTx.value.hex,
		selectedNetwork,
		selectedWallet,
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

	const finalizeResponse = await blocktank.finalizeChannel(
		buyChannelResponse.value.order_id,
	);
	console.log('finalizeResponse', finalizeResponse);
	return finalizeResponse;
};
