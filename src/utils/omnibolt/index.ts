import { err, ok, Result } from '../result';
import {
	getKeychainValue,
	resetKeychainValue,
	setKeychainValue,
} from '../helpers';
import { getStore } from '../../store/helpers';
import { ObdApi } from 'omnibolt-js';
import {
	IAcceptChannel,
	IConnect,
	IFundingBitcoin,
	IGetMyChannels,
	ILogin,
	TOnChannelOpenAttempt,
} from 'omnibolt-js/lib/types/types';
import {
	generateAddresses,
	generateMnemonic,
	getCurrentWallet,
	getKeyDerivationPath,
	getSelectedNetwork,
	getSelectedWallet,
} from '../wallet';
import {
	addOmniboltAddress,
	connectToOmnibolt,
	loginToOmnibolt,
	updateOmniboltChannels,
	updateOmniboltCheckpoint,
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
import { IAddressContent } from '../../store/types/wallet';
import { resumeFromCheckponts } from './checkpoints';

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
	return await obdapi.connect({
		url,
		onChannelOpenAttempt,
		onAcceptChannel,
	});
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
 * Attempts to create an omnibolt user id if none exists for a given wallet.
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
			selectedWallet = getSelectedWallet();
		}
		const omniboltIdResponse = await getOmniboltLoginId({ selectedWallet });
		if (omniboltIdResponse.isErr()) {
			//Create and add initial omnibolt address.
			await addOmniboltAddress({ selectedWallet });

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
 * Attempts to delete an omnibolt user id for the specified wallet.
 * @async
 * @param {string} [selectedWallet]
 * @return {Promise<Result<boolean>>}
 */
export const deleteOmniboltId = async ({
	selectedWallet = undefined,
}: {
	selectedWallet?: string | undefined;
}): Promise<Result<boolean>> => {
	try {
		if (!selectedWallet) {
			selectedWallet = getSelectedWallet();
		}
		const omniboltKey = getOmniboltKey({ selectedWallet });
		const resetResponse = await resetKeychainValue({
			key: omniboltKey,
		});
		if (resetResponse.isErr()) {
			return ok(false);
		}
		return ok(true);
	} catch (e) {
		return ok(e);
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
		const loginResponse = await loginToOmnibolt({
			selectedWallet,
			selectedNetwork,
		});

		if (loginResponse.isErr()) {
			return err(loginResponse.error.message);
		}
		//Update available/pending channels
		await updateOmniboltChannels({ selectedWallet, selectedNetwork });

		await resumeFromCheckponts();

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
	data: TOnChannelOpenAttempt,
): Promise<Result<TOnChannelOpenAttempt>> => {
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
		//Save data at checkpoint and attempt to accept the channel later.
		updateOmniboltCheckpoint({
			channelId: data.result.temporary_channel_id,
			checkpoint: 'onChannelOpenAttempt',
			data,
		}).then();
		return err(response.error.message);
	}
	await updateOmniboltChannels({});
	return ok(data);
};

/**
 * This method returns a new omnibolt address based on the previous address index.
 * @async
 * @param {string} [selectedWallet]
 * @param {TAvailableNetworks} [selectedNetwork]
 * @return {<Promise<Result<IAddressContent>>>}
 */
export const getNextOmniboltAddress = async ({
	selectedWallet = undefined,
	selectedNetwork = undefined,
}: {
	selectedWallet?: undefined | string;
	selectedNetwork?: undefined | TAvailableNetworks;
}): Promise<Result<IAddressContent>> => {
	if (!selectedNetwork) {
		selectedNetwork = getSelectedNetwork();
	}
	if (!selectedWallet) {
		selectedWallet = getSelectedWallet();
	}
	let index = 0;
	let addressIndex;
	try {
		addressIndex = getStore().omnibolt?.wallets[selectedWallet]?.addressIndex[
			selectedNetwork
		];
	} catch {}
	if (addressIndex && addressIndex?.index >= 0) {
		index = addressIndex.index + 1;
	}
	const keyDerivationPath = getKeyDerivationPath({
		selectedWallet,
		selectedNetwork,
	});
	const generatedAddress = await generateAddresses({
		selectedNetwork,
		selectedWallet,
		accountType: 'omnibolt',
		addressType: 'legacy', //TODO: Change this to the user's selected addressType once bech32 is supported by omnibolt.
		addressAmount: 1,
		addressIndex: index,
		changeAddressAmount: 0,
		keyDerivationPath,
	});
	if (generatedAddress.isOk()) {
		return ok(Object.values(generatedAddress.value.addresses)[0]);
	} else {
		return err(generatedAddress.error);
	}
};

/**
 * This method is called when a channel has successfully been accepted.
 * @param {IAcceptChannel} data
 */
export const onAcceptChannel = (data: IAcceptChannel): void => {
	//TODO: This checkpoint is probably not needed, but being included anyway for the time being.
	updateOmniboltCheckpoint({
		channelId: data?.temporary_channel_id,
		checkpoint: 'onAcceptChannel',
		data,
	}).then();
	updateOmniboltChannels({}).then();
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

export const fundingBitcoin = async ({
	from_address = '',
	to_address = '',
	amount = 0, //0.0004
	miner_fee = 0, //0.0001
}): Promise<Result<IFundingBitcoin>> => {
	return await obdapi.fundingBitcoin({
		from_address,
		to_address,
		amount,
		miner_fee,
	});
};

export const onFundingBitcoin = (data): void => {
	console.log('onFundingBitcoin', data);
};

export const bitcoinFundingCreated = async ({
	recipient_node_peer_id = '',
	recipient_user_peer_id = '',
	temporary_channel_id = '',
	funding_tx_hex = '',
}: {
	recipient_node_peer_id: string;
	recipient_user_peer_id: string;
	temporary_channel_id: string;
	funding_tx_hex: string;
}): Promise<unknown> => {
	const info = {
		temporary_channel_id,
		funding_tx_hex,
	};
	return await obdapi.bitcoinFundingCreated(
		recipient_node_peer_id,
		recipient_user_peer_id,
		info,
	);
};
