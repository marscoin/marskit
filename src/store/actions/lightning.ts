import actions from './actions';
import { getDispatch, getStore } from '../helpers';
import { err, ok, Result } from '@synonymdev/result';
import { LNURLChannelParams } from 'js-lnurl';
import { getLNURLParams, lnurlChannel } from '@synonymdev/react-native-lnurl';
import { getSelectedNetwork, getSelectedWallet } from '../../utils/wallet';
import { TAvailableNetworks } from '../../utils/networks';
import {
	getLightningChannels,
	getNodeIdFromStorage,
	getNodeVersion,
} from '../../utils/lightning';
import { TChannel } from '@synonymdev/react-native-ldk';
import { TLightningNodeVersion } from '../types/lightning';

const dispatch = getDispatch();

export const updateLightning = ({
	payload,
	selectedWallet,
	selectedNetwork,
}: {
	payload: any;
	selectedWallet?: string;
	selectedNetwork?: TAvailableNetworks;
}): Result<string> => {
	if (!selectedWallet) {
		selectedWallet = getSelectedWallet();
	}
	if (!selectedNetwork) {
		selectedNetwork = getSelectedNetwork();
	}

	dispatch({
		type: actions.UPDATE_LIGHTNING,
		payload: {
			...payload,
			selectedNetwork,
			selectedWallet,
		},
	});
	return ok('');
};

/**
 * Attempts to update the node id for the given wallet and network.
 * @param {string} nodeId
 * @param {string} [selectedWallet]
 * @param {TAvailableNetworks} [selectedNetwork]
 */
export const updateLightningNodeId = async ({
	nodeId,
	selectedWallet,
	selectedNetwork,
}: {
	nodeId: string;
	selectedWallet?: string;
	selectedNetwork?: TAvailableNetworks;
}): Promise<Result<string>> => {
	if (!selectedNetwork) {
		selectedNetwork = getSelectedNetwork();
	}
	if (!selectedWallet) {
		selectedWallet = getSelectedWallet();
	}
	const nodeIdFromStorage = getNodeIdFromStorage({
		selectedWallet,
		selectedNetwork,
	});
	if (nodeId && nodeIdFromStorage !== nodeId) {
		const payload = {
			nodeId,
			selectedWallet,
			selectedNetwork,
		};
		dispatch({
			type: actions.UPDATE_LIGHTNING_NODE_ID,
			payload,
		});
	}
	return ok('No need to update nodeId.');
};

/**
 * Attempts to update the lightning channels for the given wallet and network.
 * This method will save all channels (both pending, open & closed) to redux and update openChannelIds to reference channels that are currently open.
 * @param {string} [selectedWallet]
 * @param {TAvailableNetworks} [selectedNetwork]
 */
export const updateLightningChannels = async ({
	selectedWallet,
	selectedNetwork,
}: {
	selectedWallet?: string;
	selectedNetwork?: TAvailableNetworks;
}): Promise<Result<TChannel[]>> => {
	if (!selectedNetwork) {
		selectedNetwork = getSelectedNetwork();
	}
	if (!selectedWallet) {
		selectedWallet = getSelectedWallet();
	}
	const lightningChannels = await getLightningChannels();
	if (lightningChannels.isErr()) {
		return err(lightningChannels.error.message);
	}

	const channels: { [key: string]: TChannel } = {};
	const openChannelIds: string[] = [];
	await Promise.all(
		lightningChannels.value.map((channel) => {
			channels[channel.channel_id] = channel;
			if (!openChannelIds.includes(channel.channel_id)) {
				openChannelIds.push(channel.channel_id);
			}
		}),
	);
	const payload = {
		channels,
		openChannelIds,
		selectedWallet,
		selectedNetwork,
	};
	dispatch({
		type: actions.UPDATE_LIGHTNING_CHANNELS,
		payload,
	});
	return ok(lightningChannels.value);
};

/**
 * Attempts to grab, update and save the lightning node version to storage.
 * @returns {Promise<Result<TLightningNodeVersion>>}
 */
export const updateLightningNodeVersion = async (): Promise<
	Result<TLightningNodeVersion>
> => {
	try {
		const version = await getNodeVersion();
		if (version.isErr()) {
			return err(version.error.message);
		}
		const currentVersion = getStore()?.lightning?.version;
		if (version.value.ldk !== currentVersion.ldk) {
			dispatch({
				type: actions.UPDATE_LIGHTNING_NODE_VERSION,
				payload: { version: version.value },
			});
		}
		return ok(version.value);
	} catch (e) {
		console.log(e);
		return err(e);
	}
};

/**
 * Claims a lightning channel from a lnurl-channel string
 * @param {string} lnurl
 * @returns {Promise<Result<string>>}
 */
export const claimChannelFromLnurlString = (
	lnurl: string,
): Promise<Result<string>> => {
	return new Promise(async (resolve) => {
		const res = await getLNURLParams(lnurl);
		if (res.isErr()) {
			return resolve(err(res.error));
		}

		const params = res.value as LNURLChannelParams;
		if (params.tag !== 'channelRequest') {
			return resolve(err('Not a channel request lnurl'));
		}

		resolve(claimChannel(params));
	});
};

/**
 * Claims a lightning channel from a decoded lnurl-channel request
 * @param {LNURLChannelParams} params
 * @returns {Promise<Result<string>>}
 */
export const claimChannel = (
	params: LNURLChannelParams,
): Promise<Result<string>> => {
	return new Promise(async (resolve) => {
		// TODO: Connect to peer from URI.
		const lnurlRes = await lnurlChannel({
			params,
			isPrivate: true,
			cancel: false,
			localNodeId: '',
		});

		if (lnurlRes.isErr()) {
			return resolve(err(lnurlRes.error));
		}

		resolve(ok(lnurlRes.value));
	});
};

/*
 * This resets the lightning store to defaultLightningShape
 */
export const resetLightningStore = (): Result<string> => {
	dispatch({
		type: actions.RESET_LIGHTNING_STORE,
	});
	return ok('');
};
