import bt, {
	IBuyChannelRequest,
	IBuyChannelResponse,
	IFinalizeChannelResponse,
	IGetOrderResponse,
	IService,
} from '@synonymdev/blocktank-client';
import { TAvailableNetworks } from '../networks';
import { err, ok, Result } from '@synonymdev/result';
import { IFinalizeChannelRequest } from '@synonymdev/blocktank-client/dist/types';

/**
 * Sets the selectedNetwork for Blocktank.
 * @param {TAvailableNetworks} selectedNetwork
 * @returns {void}
 */
export const setupBlocktank = (selectedNetwork: TAvailableNetworks): void => {
	if (selectedNetwork === 'bitcoinTestnet') {
		return;
	} else if (selectedNetwork === 'bitcoinRegtest') {
		bt.setNetwork('regtest');
	} else {
		bt.setNetwork('mainnet');
	}
};

/**
 * @returns {Promise<Result<IService[]>>}
 */
export const getAvailableServices = async (): Promise<Result<IService[]>> => {
	try {
		// Get all node info and available services
		const info = await bt.getInfo();
		if (
			info?.services &&
			Array.isArray(info.services) &&
			info.services.length > 0
		) {
			return ok(info.services);
		}
		return err('Unable to provide services from Blocktank at this time.');
	} catch (e) {
		return err(e);
	}
};

/**
 * @param {IBuyChannelRequest} data
 * @returns {Promise<Result<IBuyChannelResponse>>}
 */
export const buyChannel = async (
	data: IBuyChannelRequest,
): Promise<Result<IBuyChannelResponse>> => {
	try {
		const buyRes = await bt.buyChannel(data);
		return ok(buyRes);
	} catch (e) {
		console.log(e);
		return err(e);
	}
};

/**
 * @param {string} orderId
 * @returns {Promise<Result<IGetOrderResponse>>}
 */
export const getOrder = async (
	orderId: string,
): Promise<Result<IGetOrderResponse>> => {
	try {
		const orderState = await bt.getOrder(orderId);
		return ok(orderState);
	} catch (e) {
		return err(e);
	}
};

/**
 * @param {IFinalizeChannelRequest} params
 * @returns {Promise<Result<IFinalizeChannelResponse>>}
 */
export const finalizeChannel = async (
	params: IFinalizeChannelRequest,
): Promise<Result<IFinalizeChannelResponse>> => {
	try {
		const finalizeChannelResponse = await bt.finalizeChannel(params);
		if (finalizeChannelResponse) {
			return ok(finalizeChannelResponse);
		}
		return err('Unable to finalize the Blocktank channel.');
	} catch (e) {
		console.log(e);
		return err(e);
	}
};

/**
 * @param code
 * @returns {string}
 */
export const getStateMessage = (code: number): string => {
	switch (code) {
		case 0:
			return 'Awaiting payment';
		case 100:
			return 'Paid';
		case 150:
			return 'Payment refunded';
		case 200:
			return 'Queued for opening';
		case 300:
			return 'Channel opening';
		case 350:
			return 'Channel closing';
		case 400:
			return 'Given up';
		case 410:
			return 'Order expired';
		case 450:
			return 'Channel closed';
		case 500:
			return 'Channel open';
	}

	return `Unknown code: ${code}`;
};
