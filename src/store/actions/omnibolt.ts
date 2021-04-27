import actions from './actions';
import { err, ok, Result } from '../../utils/result';
import { getDispatch, getStore } from '../helpers';
import { TAvailableNetworks } from '../../utils/networks';
import {
	IConnect,
	IGetMyChannelsData,
	ILogin,
} from 'omnibolt-js/lib/types/types';
import * as omnibolt from '../../utils/omnibolt';
import {
	IChannelSigningData,
	IOmniboltConnectData,
	TSigningDataKey,
	TOmniboltCheckpoints,
	TOmniboltCheckpontData,
	IUpdateOmniboltChannelSigningData,
} from '../types/omnibolt';
import { getSelectedNetwork, getSelectedWallet } from '../../utils/wallet';
import {
	createOmniboltId,
	getNextOmniboltAddress,
	getOmniboltChannels,
	getOmniboltUserData,
} from '../../utils/omnibolt';
import {
	defaultOmniboltWalletShape,
	ICheckpoint,
	IMyChannelsData,
} from '../shapes/omnibolt';
import { IAddressContent } from '../types/wallet';

const dispatch = getDispatch();

export const updateOmnibolt = (payload): Result<string> => {
	dispatch({
		type: actions.UPDATE_OMNIBOLT,
		payload,
	});
	return ok('');
};

/*
 * This resets the omnibolt store to defaultOmniBoltShape
 */
export const resetOmniBoltStore = (): Result<string> => {
	dispatch({
		type: actions.RESET_OMNIBOLT_STORE,
	});
	return ok('');
};

/**
 * Connects to the specified omnibolt server and updates omnibolt.userData info with the response.
 * @param {string} url
 */
export const connectToOmnibolt = async ({
	url = '',
}: {
	url?: string;
}): Promise<Result<IConnect>> => {
	const connectResponse = await omnibolt.connect({
		url,
	});
	if (connectResponse.isErr()) {
		return err(connectResponse.error.message);
	}
	// Ensure we're getting the necessary data.
	if (!connectResponse.value?.recipient_node_peer_id) {
		return err(connectResponse.value.toString());
	}
	dispatch({
		type: actions.UPDATE_OMNIBOLT_USERDATA,
		payload: connectResponse.value,
	});
	return ok(connectResponse.value);
};

/**
 * This method attempts to login to an omnibolt server for a given wallet.
 * Once logged in, it will save the user data with UPDATE_OMNIBOLT_USERDATA accordingly.
 * @async
 * @param {string} [selectedWallet]
 * @param {TAvailableNetworks} [selectedNetwork]
 * @return {Promise<Result<ILogin>>}
 */
export const loginToOmnibolt = async ({
	selectedWallet = undefined,
	selectedNetwork = undefined,
}: {
	selectedWallet?: string | undefined;
	selectedNetwork?: TAvailableNetworks | undefined;
}): Promise<Result<ILogin>> => {
	return new Promise(async (resolve) => {
		if (!selectedWallet) {
			selectedWallet = getSelectedWallet();
		}
		if (!selectedNetwork) {
			selectedNetwork = getSelectedNetwork();
		}
		const loginResponse: Result<ILogin> = await omnibolt.login({
			selectedWallet,
		});

		if (loginResponse.isOk()) {
			const data = loginResponse.value;
			if (!data) {
				return err('No data provided.');
			}
			if (!data?.nodeAddress) {
				return err(data.toString());
			}
			const payload = {
				selectedWallet,
				selectedNetwork,
				userData: loginResponse.value,
			};
			dispatch({
				type: actions.UPDATE_OMNIBOLT_USERDATA,
				payload,
			});
			return resolve(loginResponse);
		} else {
			return err(loginResponse.error.message);
		}
	});
};

/**
 * connectData is used to temporarily store info when attempting to connect with a peer.
 * @param data
 * @param selectedWallet
 * @param selectedNetwork
 */
export const updateOmniboltConnectData = ({
	data,
	selectedWallet = undefined,
	selectedNetwork = undefined,
}: {
	data: IOmniboltConnectData;
	selectedWallet: string | undefined;
	selectedNetwork: TAvailableNetworks | undefined;
}): Result<string> => {
	if (!data?.nodeAddress || !data?.nodePeerId || !data?.userPeerId) {
		return err('Invalid Data');
	}
	if (!selectedNetwork) {
		selectedNetwork = getSelectedNetwork();
	}
	if (!selectedWallet) {
		selectedWallet = getSelectedWallet();
	}
	dispatch({
		type: actions.UPDATE_OMNIBOLT_CONNECTDATA,
		payload: { data, selectedWallet, selectedNetwork },
	});
	return ok('Connect Data Updated.');
};

export const onConnectPeer = ({
	data = {},
	selectedWallet = undefined,
	selectedNetwork = undefined,
}: {
	data: any;
	selectedWallet?: string | undefined;
	selectedNetwork?: TAvailableNetworks | undefined;
}): Result<string> => {
	if (!selectedNetwork) {
		selectedNetwork = getSelectedNetwork();
	}
	if (!selectedWallet) {
		selectedWallet = getSelectedWallet();
	}
	dispatch({
		type: actions.UPDATE_OMNIBOLT_PEERS,
		payload: { data, selectedNetwork, selectedWallet },
	});
	return ok('Connect Data Updated.');
};

export const createOmniboltWallet = async ({
	selectedWallet = undefined,
}: {
	selectedWallet?: string | undefined;
}): Promise<Result<string>> => {
	if (!selectedWallet) {
		selectedWallet = getSelectedWallet();
	}
	// Check that this wallet doesn't already exist.
	if (getStore().omnibolt?.wallets[selectedWallet]) {
		return ok('Wallet already exists.');
	}
	// Create login id for the new wallet.
	const idResponse = await createOmniboltId({ selectedWallet });
	if (idResponse.isErr()) {
		return err(idResponse.error.message);
	}
	const payload = {
		[selectedWallet]: defaultOmniboltWalletShape,
	};

	await dispatch({
		type: actions.CREATE_OMNIBOLT_WALLET,
		payload,
	});
	return ok('Connect Data Updated.');
};

export interface IUpdateOmniboltChannels {
	channels: { [key: string]: IGetMyChannelsData };
	tempChannels: { [key: string]: IGetMyChannelsData };
}
/**
 * This will query omnibolt for current channels and update the store accordingly.
 * @param selectedWallet
 * @param selectedNetwork
 * @return {Promise<Result<IGetMyChannelsData[]>>}
 */
export const updateOmniboltChannels = async ({
	selectedWallet = undefined,
	selectedNetwork = undefined,
}: {
	selectedWallet?: string | undefined;
	selectedNetwork?: TAvailableNetworks | undefined;
}): Promise<Result<IUpdateOmniboltChannels>> => {
	if (!selectedNetwork) {
		selectedNetwork = getSelectedNetwork();
	}
	if (!selectedWallet) {
		selectedWallet = getSelectedWallet();
	}
	//Get and store address, channel and asset information
	const response = await getOmniboltChannels();
	if (response.isErr()) {
		return err(response.error.message);
	}
	//Get and store channel info
	let channels: { [key: string]: IMyChannelsData } = {};
	let tempChannels: { [key: string]: IMyChannelsData } = {};
	if (response?.value?.data && selectedNetwork) {
		const userData = getOmniboltUserData({ selectedNetwork, selectedWallet });
		if (userData.isErr()) {
			return err(userData.error.message);
		}
		const userPeerId = userData.value.userPeerId;
		//Sort temp and established channels
		await Promise.all(
			response.value.data.map((channel) => {
				try {
					const funder = userPeerId === channel.peer_ida;
					const data = { ...channel, funder };
					if (channel.channel_id === '') {
						tempChannels[channel.temporary_channel_id] = data;
					} else {
						channels[channel.channel_id] = data;
					}
				} catch {}
			}),
		);
	}
	const payload = {
		selectedNetwork,
		selectedWallet,
		channels,
		tempChannels,
	};
	await dispatch({
		type: actions.UPDATE_OMNIBOLT_CHANNELS,
		payload,
	});
	return ok({ channels, tempChannels });
};

interface IUpdateOmniboltCheckpoint {
	data?: TOmniboltCheckpontData;
	channelId: string | undefined;
	checkpoint: TOmniboltCheckpoints | undefined;
	selectedWallet?: string | undefined;
	selectedNetwork?: TAvailableNetworks | undefined;
}

/**
 * This method updates a checkpoint's data and checkpoint id based on the channelId.
 * @param {TOmniboltCheckpontData} data
 * @param {string} channelId
 * @param {TOmniboltCheckpoints} checkpoint
 * @param {string} [selectedWallet]
 * @param {TAvailableNetworks} [selectedNetwork]
 * @return {Promise<Result<IUpdateOmniboltCheckpoint>>}
 */
export const updateOmniboltCheckpoint = async ({
	data = {},
	channelId = undefined,
	checkpoint = undefined,
	selectedWallet = undefined,
	selectedNetwork = undefined,
}: IUpdateOmniboltCheckpoint): Promise<Result<IUpdateOmniboltCheckpoint>> => {
	if (!channelId) {
		return err('No channelId specified.');
	}
	if (!checkpoint) {
		return err('No checkpoint specified.');
	}
	if (!selectedNetwork) {
		selectedNetwork = getSelectedNetwork();
	}
	if (!selectedWallet) {
		selectedWallet = getSelectedWallet();
	}

	const payload = {
		selectedWallet,
		selectedNetwork,
		channelId,
		checkpoint,
		data,
	};

	await dispatch({
		type: actions.UPDATE_OMNIBOLT_CHECKPOINT,
		payload,
	});

	return ok(payload);
};

interface IClearOmniboltCheckpoint {
	selectedWallet?: string | undefined;
	selectedNetwork?: TAvailableNetworks | undefined;
	channelId: string | undefined;
}

/**
 * This method removes any previously stored checkpoints for a specified channel id.
 * @param channelId
 * @param {string} [selectedWallet]
 * @param {TAvailableNetworks} [selectedNetwork]
 * @return {Promise<Result<ICheckpoint>>}
 */
export const clearOmniboltCheckpoint = async ({
	channelId = undefined,
	selectedWallet = undefined,
	selectedNetwork = undefined,
}: IClearOmniboltCheckpoint): Promise<Result<ICheckpoint>> => {
	if (!channelId) {
		return err('No channelId specified.');
	}
	if (!selectedNetwork) {
		selectedNetwork = getSelectedNetwork();
	}
	if (!selectedWallet) {
		selectedWallet = getSelectedWallet();
	}

	const checkpoints = getStore().omnibolt.wallets[selectedWallet].checkpoints[
		selectedNetwork
	];

	if (channelId in checkpoints) {
		delete checkpoints[channelId];
	}

	const payload = {
		selectedWallet,
		selectedNetwork,
		checkpoints,
	};

	await dispatch({
		type: actions.CLEAR_OMNIBOLT_CHECKPOINT,
		payload,
	});

	return ok(checkpoints);
};

/**
 * This method adds a new omnibolt address based on the previous address index.
 * @param {string} [selectedWallet]
 * @param {TAvailableNetworks} [selectedNetwork]
 */
export const addOmniboltAddress = async ({
	selectedWallet = undefined,
	selectedNetwork = undefined,
}: {
	selectedWallet?: string | undefined;
	selectedNetwork?: TAvailableNetworks | undefined;
}): Promise<Result<IAddressContent>> => {
	if (!selectedWallet) {
		selectedWallet = getSelectedWallet();
	}
	if (!selectedNetwork) {
		selectedNetwork = getSelectedNetwork();
	}
	const response = await getNextOmniboltAddress({
		selectedWallet,
		selectedNetwork,
	});
	if (response.isOk()) {
		const payload = {
			selectedWallet,
			selectedNetwork,
			data: response.value,
		};
		await dispatch({
			type: actions.ADD_OMNIBOLT_ADDRESS,
			payload,
		});
		return ok(response.value);
	} else {
		return err(response.error);
	}
};

/**
 * This method updates an associated omnibolt channel address.
 * @param {string} [selectedWallet]
 * @param {TAvailableNetworks} [selectedNetwork]
 * @param {TSigningDataKey} channelAddressId
 * @param {IAddressContent | string | undefined} [signingData]
 * @param {string} channelId
 */
export const updateOmniboltChannelSigningData = async ({
	channelId,
	signingDataKey = 'fundingAddress',
	selectedWallet = undefined,
	selectedNetwork = undefined,
	signingData = undefined,
}: {
	channelId: string;
	signingDataKey: TSigningDataKey;
	selectedWallet?: string | undefined;
	selectedNetwork?: TAvailableNetworks | undefined;
	signingData?: IAddressContent | string | undefined;
}): Promise<Result<IUpdateOmniboltChannelSigningData>> => {
	if (!signingData) {
		return err('No channelAddress specified.');
	}
	if (!selectedWallet) {
		selectedWallet = getSelectedWallet();
	}
	if (!selectedNetwork) {
		selectedNetwork = getSelectedNetwork();
	}
	if (!signingData) {
		const response = await addOmniboltAddress({
			selectedWallet,
			selectedNetwork,
		});
		if (response.isErr()) {
			return err(response.error.message);
		}
		signingData = response.value;
	}
	const payload = {
		channelId,
		signingDataKey,
		signingData,
	};
	await dispatch({
		type: actions.UPDATE_OMNIBOLT_CHANNEL_SIGNING_DATA,
		payload,
	});
	return ok(payload);
};

/**
 * This method is used to rename a pending channel's temporary channel id to the new channel id.
 * @param {string} oldChannelId
 * @param {string} newChannelId
 * @param {string} [selectedWallet]
 * @param {TAvailableNetworks} [selectedNetwork]
 */
export const renameOmniboltChannelId = async ({
	oldChannelId,
	newChannelId,
	selectedWallet = undefined,
	selectedNetwork = undefined,
}: {
	oldChannelId: string;
	newChannelId: string;
	selectedWallet?: string | undefined;
	selectedNetwork?: TAvailableNetworks | undefined;
}): Promise<Result<IChannelSigningData>> => {
	if (!oldChannelId) {
		return err('No oldChannelId specified.');
	}
	if (!newChannelId) {
		return err('No newChannelId specified.');
	}
	if (!selectedWallet) {
		selectedWallet = getSelectedWallet();
	}
	if (!selectedNetwork) {
		selectedNetwork = getSelectedNetwork();
	}
	let signingData = getStore().omnibolt.wallets[selectedWallet].signingData[
		selectedNetwork
	];
	if (!(oldChannelId in signingData)) {
		return err('Channel ID does not exist.');
	}
	signingData[newChannelId] = signingData[oldChannelId];
	delete signingData[oldChannelId];

	const payload = {
		selectedWallet,
		selectedNetwork,
		signingData,
	};
	await dispatch({
		type: actions.UPDATE_OMNIBOLT_CHANNEL_ADDRESSES_KEY,
		payload,
	});
	return ok(signingData);
};
