import { err, ok, Result } from '../result';
import { getKeychainValue, setKeychainValue } from '../helpers';
import { getStore } from '../../store/helpers';
import { ObdApi } from 'omnibolt-js';
import {
	IConnect,
	IGetMyChannels,
	ILogin,
	IOnChannelOpenAttempt,
} from 'omnibolt-js/lib/types/types';
import {
	generateMnemonic,
	getCurrentWallet,
	getSelectedNetwork,
	getSelectedWallet,
} from '../wallet';
import {
	connectToOmnibolt,
	loginToOmnibolt,
	updateOmniboltChannels,
} from '../../store/actions/omnibolt';
import {
	IOmniboltConnectData,
	IOmniBoltUserData,
} from '../../store/types/omnibolt';
import { TAvailableNetworks } from '../networks';
import {
	IssueFixedAmountInfo,
	OpenChannelInfo,
} from 'omnibolt-js/lib/types/pojo';
const obdapi = new ObdApi();

/**
 * Connect to a specified omnibolt server.
 * @param {string} [url]
 * @return {Promise<Result<IConnect>>}
 */
export const connect = async ({
	url = '',
}: {
	url?: string;
}): Promise<Result<IConnect>> => {
	return await obdapi.connect({ url });
};

/**
 * Login
 * @async
 * @param {string} selectedWallet
 * @return {Promise<Result<ILogin>>}
 */
export const login = async ({
	selectedWallet = undefined,
}: {
	selectedWallet?: string | undefined;
}): Promise<Result<ILogin>> => {
	if (!selectedWallet) {
		selectedWallet = getStore().wallet.selectedWallet;
	}
	const idResponse = await getOmniboltLoginId({ selectedWallet });
	if (idResponse.isErr()) {
		return err(idResponse.error.message);
	}
	return await obdapi.logIn(idResponse.value);
};

/**
 * Get omnibolt id/mnemonic phrase to login.
 * @async
 * @param {string|undefined} [selectedWallet
 * @return {string}
 */
export const getOmniboltLoginId = async ({
	selectedWallet = undefined,
}: {
	selectedWallet?: string | undefined;
}): Promise<Result<string>> => {
	try {
		if (!selectedWallet) {
			selectedWallet = getStore().wallet.selectedWallet;
		}
		const key = getOmniboltKey({ selectedWallet });
		const response = await getKeychainValue({ key });
		if (response.error) {
			return err(response.data);
		} else {
			return ok(response.data);
		}
	} catch (e) {
		return err(e);
	}
};

/**
 * Attmepts to create an omnibolt user id if none exists for a given wallet.
 * @async
 * @param {string} [selectedWallet]
 * @return {Promise<Result<string>>}
 */
export const createOmniboltId = async ({
	selectedWallet = undefined,
}: {
	selectedWallet?: string | undefined;
}): Promise<Result<string>> => {
	try {
		if (!selectedWallet) {
			selectedWallet = getStore().wallet.selectedWallet;
		}
		const omniboltIdResponse = await getOmniboltLoginId({ selectedWallet });
		if (omniboltIdResponse.isErr()) {
			const key = getOmniboltKey({ selectedWallet });
			//Check if key already exists.
			const response = await getKeychainValue({ key });
			if (!response.error) {
				return ok(response.data);
			}
			const id = await generateMnemonic();
			const keychainResponse = await setKeychainValue({ key, value: id });
			if (keychainResponse.error) {
				return err(keychainResponse.data);
			}
			return ok(id);
		}
		return ok(omniboltIdResponse.value);
	} catch (e) {
		return err(e);
	}
};

/**
 * Returns the key used in 'getKeychainValue' that stores the omnibolt user id for the selected wallet.
 * Key Example: wallet0omnibolt
 * @param {string} [selectedWallet]
 * @return {string}
 */
export const getOmniboltKey = ({
	selectedWallet = undefined,
}: {
	selectedWallet?: string | undefined;
}): string => {
	try {
		if (!selectedWallet) {
			selectedWallet = getStore().wallet.selectedWallet;
		}
		return `${selectedWallet}omnibolt`;
	} catch {
		return 'wallet0omnibolt';
	}
};

/**
 * Create omnibolt id if none exists, connect to an omnibolt server and login with said id.
 * @async
 * @param {string|undefined} [selectedWallet]
 * @param {string|undefined} [selectedNetwork]
 * @return {Promise<Result<ILogin>>}
 */
export const startOmnibolt = async ({
	selectedWallet = undefined,
	selectedNetwork = undefined,
}: {
	selectedWallet?: string | undefined;
	selectedNetwork?: TAvailableNetworks | undefined;
}): Promise<Result<ILogin>> => {
	try {
		if (!selectedWallet) {
			selectedWallet = getSelectedWallet();
		}

		if (!selectedNetwork) {
			selectedNetwork = getSelectedNetwork();
		}

		//Create omnibolt user if necessary.
		await createOmniboltId({ selectedWallet });

		//Connect to an omnibolt server.
		const url = ''; // TODO: Run selectedNetwork check here to toggle between testnet and mainnet url.
		const connectResponse = await connectToOmnibolt({ url });
		if (connectResponse.isErr()) {
			return err(connectResponse.error.message);
		}

		//Login using the stored omnibolt user id.
		const loginResponse = await loginToOmnibolt({ selectedWallet });
		if (loginResponse.isErr()) {
			return err(loginResponse.error.message);
		}
		//Update available/pending channels
		await updateOmniboltChannels({ selectedWallet, selectedNetwork });
		return ok(loginResponse.value);
	} catch (e) {
		console.log(e);
		return err(e);
	}
};

/**
 * This connects to the specified node address.
 * @async
 * @param nodeAddress
 * @return {string}
 */
export const connectToPeer = async ({
	nodeAddress = '',
}: {
	nodeAddress: string;
}): Promise<Result<string>> => {
	try {
		return await obdapi.connectPeer({
			remote_node_address: nodeAddress,
		});
	} catch (e) {
		return err(e);
	}
};

/**
 * This parses connect information generated by getConnectPeerInfo.
 * @async
 * @param data
 * @return {Promise<Result<IOmniboltConnectData>>}
 */
export const parseOmniboltConnectData = async (
	data = '',
): Promise<Result<IOmniboltConnectData>> => {
	try {
		data = data.trim();
		const parsedData = JSON.parse(data);
		if (
			!parsedData?.nodeAddress ||
			!parsedData?.nodePeerId ||
			!parsedData?.userPeerId
		) {
			return err('Invalid Data');
		}
		return ok(parsedData);
	} catch (e) {
		return err(e);
	}
};

/**
 * Returns the data needed used to connect with other peers.
 * Response Example: JSON.stringify({ nodeAddress, nodePeerId, userPeerId })
 * @param [selectedWallet]
 * @param [selectedNetwork]
 * @return {string}
 */
export const getConnectPeerInfo = ({
	selectedWallet = undefined,
	selectedNetwork = undefined,
}: {
	selectedWallet?: string | undefined;
	selectedNetwork?: TAvailableNetworks | undefined;
}): string => {
	try {
		if (!selectedWallet) {
			selectedWallet = getSelectedWallet();
		}
		if (!selectedNetwork) {
			selectedNetwork = getSelectedNetwork();
		}
		const omniboltStore = getStore().omnibolt.wallets;
		if (!omniboltStore[selectedWallet]?.userData[selectedNetwork]) {
			return '';
		}
		const { nodeAddress, nodePeerId, userPeerId } = omniboltStore[
			selectedWallet
		]?.userData[selectedNetwork];
		return JSON.stringify({
			nodeAddress,
			nodePeerId,
			userPeerId,
		});
	} catch {
		return '';
	}
};

/**
 * TODO: obdapi.issueFixedAmount appears to no longer to work as expected.
 * Creates an omnibolt asset.
 * @async
 * @param name
 * @param amount
 * @param description
 * @return {Promise<Result<unknown>>}
 */
export const createAsset = async ({
	name = '',
	amount = 0,
	description = '',
}: {
	name: string;
	amount: number;
	description: string;
}): Promise<Result<unknown>> => {
	try {
		const { currentWallet, selectedNetwork } = getCurrentWallet({});
		const address = currentWallet.utxos[selectedNetwork][0].address;
		const info: IssueFixedAmountInfo = {
			from_address: address,
			name,
			ecosystem: 2,
			divisible_type: 2,
			amount: Number(amount),
			data: description,
		};
		return await obdapi.issueFixedAmount(info);
	} catch (e) {
		return err(e);
	}
};

/**
 * Attempts to open an omnibolt channel
 * @async
 * @param [selectedWallet]
 * @param [selectedNetwork]
 * @return {Promise<Result<string>>}
 */
export const openOmniboltChannel = async ({
	selectedWallet = undefined,
	selectedNetwork = undefined,
}: {
	selectedWallet?: undefined | string;
	selectedNetwork?: undefined | TAvailableNetworks;
}): Promise<Result<string>> => {
	if (!selectedNetwork) {
		selectedNetwork = getSelectedNetwork();
	}
	if (!selectedWallet) {
		selectedWallet = getSelectedWallet();
	}
	const { address } = getStore().wallet.wallets[selectedWallet].utxos[
		selectedNetwork
	][0];
	const info: OpenChannelInfo = {
		funding_pubkey: address,
		is_private: false,
	};
	const userData = getOmniboltUserData({});
	if (userData.isErr()) {
		return err(userData.error.message);
	}

	const { recipient_node_peer_id, recipient_user_peer_id } = userData.value;
	return await obdapi.openChannel(
		recipient_node_peer_id,
		recipient_user_peer_id,
		info,
	);
};

/**
 * Returns omnibolt user data from local storage.
 * @param {string|undefined} [selectedWallet]
 * @param {string|undefined} [selectedNetwork]
 * @return {Promise<Result<IOmniBoltUserData>>}
 */
export const getOmniboltUserData = ({
	selectedWallet = undefined,
	selectedNetwork = undefined,
}: {
	selectedWallet?: undefined | string;
	selectedNetwork?: undefined | TAvailableNetworks;
}): Result<IOmniBoltUserData> => {
	try {
		if (!selectedNetwork) {
			selectedNetwork = getSelectedNetwork();
		}
		if (!selectedWallet) {
			selectedWallet = getSelectedWallet();
		}
		const userData = getStore().omnibolt.wallets[selectedWallet].userData[
			selectedNetwork
		];
		return ok(userData);
	} catch (e) {
		return err(e);
	}
};

/**
 * Used to initiate a channel opening with a peer.
 * @async
 * @param {string|undefined} [selectedWallet]
 * @param {string|undefined} [selectedNetwork]
 * @param {string} data
 * @return {Promise<Result<string>>}
 */
export const connectAndOpenChannel = async ({
	selectedWallet = undefined,
	selectedNetwork = undefined,
	data = '',
}: {
	selectedWallet?: undefined | string;
	selectedNetwork?: undefined | TAvailableNetworks;
	data: string;
}): Promise<Result<string>> => {
	try {
		if (!selectedNetwork) {
			selectedNetwork = getSelectedNetwork();
		}
		if (!selectedWallet) {
			selectedWallet = getSelectedWallet();
		}
		data = data.trim();
		const { nodeAddress = '', nodePeerId = '', userPeerId = '' } = JSON.parse(
			data,
		);

		const connectPeerResponse = await obdapi.connectPeer({
			remote_node_address: nodeAddress,
		});
		if (connectPeerResponse.isErr()) {
			console.log(`Unable to connect to:\n${nodeAddress}`);
			//return err(`Unable to connect to:\n${nodeAddress}`);
		}

		const { publicKey } = getStore().wallet.wallets[selectedWallet].utxos[
			selectedNetwork
		][0];

		const info: OpenChannelInfo = {
			funding_pubkey: publicKey,
			is_private: false,
			//funder_address_index: 1,
		};

		const openChannelResponse = await obdapi.openChannel(
			nodePeerId,
			userPeerId,
			info,
		);

		if (openChannelResponse.isErr()) {
			return err(`Unable to open channel to:\n${userPeerId}`);
		}

		return ok(
			`Success!!\nAn open channel request has been sent to:\n${userPeerId}`,
		);
	} catch (e) {
		return err(e);
	}
};

/**
 * Responds to and accepts any channel open attempt.
 * @async
 * @param {IOnChannelOpenAttempt} data
 * @return {Promise<Result<IOnChannelOpenAttempt>>}
 */
export const onChannelOpenAttempt = async (
	data: IOnChannelOpenAttempt,
): Promise<Result<IOnChannelOpenAttempt>> => {
	const {
		funder_node_address,
		funder_peer_id,
		temporary_channel_id,
		funding_pubkey,
	} = data.result;
	const response = await obdapi.acceptChannel(
		funder_node_address,
		funder_peer_id,
		{
			temporary_channel_id,
			funding_pubkey,
			approval: true,
		},
	);
	if (response.isErr()) {
		return err(response.error.message);
	}
	await updateOmniboltChannels({});
	return ok(data);
};

/**
 * Retrieves available channel information from the omnibolt server.
 * @async
 * @param {ObdApi} [obdInstance] - A separate obd instance if necessary.
 * @return {Promise<Result<IGetMyChannels>>}
 */
export const getOmniboltChannels = async (
	obdInstance: ObdApi | undefined = undefined,
): Promise<Result<IGetMyChannels>> => {
	//Get channel and asset information
	if (obdInstance) {
		return await obdInstance.getMyChannels();
	}
	return await obdapi.getMyChannels();
};
