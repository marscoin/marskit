import { err, ok, Result } from '../result';
import {
	getKeychainValue,
	resetKeychainValue,
	setKeychainValue,
} from '../helpers';
import { getStore } from '../../store/helpers';
import { ObdApi } from 'omnibolt-js';
import {
	IAssetFundingSigned,
	IBitcoinFundingSigned,
	IConnect,
	IGetMyChannels,
	ILogin,
	ISendSignedHex100361Response,
	ISendSignedHex100363Response,
	TOn110352,
	TOn110353,
	TOnAcceptChannel,
	TOnAssetFundingCreated,
	TOnBitcoinFundingCreated,
	TOnChannelOpenAttempt,
	TOnCommitmentTransactionCreated,
	TSendSignedHex101035,
	IGetProperty,
	IListenerParams,
	ISendSignedHex100364Response,
} from 'omnibolt-js/lib/types/types';
import {
	generateAddresses,
	generateMnemonic,
	getCurrentWallet,
	getKeyDerivationPath,
	getMnemonicPhrase,
	getPrivateKey,
	getSelectedNetwork,
	getSelectedWallet,
} from '../wallet';
import {
	addOmniboltAddress,
	addOmniboltAssetData,
	connectToOmnibolt,
	loginToOmnibolt,
	saveSigningData,
	updateOmniboltChannels,
} from '../../store/actions/omnibolt';
import {
	IOmniboltConnectData,
	IOmniBoltUserData,
	ISigningData,
	TSigningDataKey,
} from '../../store/types/omnibolt';
import { TAvailableNetworks } from '../networks';
import {
	AcceptChannelInfo,
	addHTLCInfo,
	AtomicSwapAccepted,
	AtomicSwapRequest,
	CloseHtlcTxInfo,
	CloseHtlcTxInfoSigned,
	ForwardRInfo,
	HTLCFindPathInfo,
	HtlcSignedInfo,
	InvoiceInfo,
	IssueFixedAmountInfo,
	IssueManagedAmoutInfo,
	OmniSendGrant,
	OmniSendRevoke,
	OpenChannelInfo,
	SignRInfo,
} from 'omnibolt-js/lib/types/pojo';
import { IAddressContent } from '../../store/types/wallet';
import { IMyChannelsData } from '../../store/shapes/omnibolt';
import { showSuccessNotification } from '../notifications';
import { ISendSignedHex100362Response } from 'omnibolt-js/src/types';

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
	const selectedWallet = getSelectedWallet();
	const selectedNetwork = getSelectedNetwork();
	const [loginId, mnemonic] = await Promise.all([
		getOmniboltLoginId({ selectedWallet }),
		getMnemonicPhrase(selectedWallet),
	]);
	if (loginId.isErr()) {
		return err(loginId.error.message);
	}
	if (mnemonic.isErr()) {
		return err(mnemonic.error.message);
	}
	const signingData =
		getStore().omnibolt.wallets[selectedWallet].signingData[selectedNetwork];
	const nextAddressIndex =
		getStore().omnibolt.wallets[selectedWallet].addressIndex[selectedNetwork];
	const checkpoints =
		getStore().omnibolt.wallets[selectedWallet].checkpoints[selectedNetwork];
	return await obdapi.connect({
		url,
		data: {
			nextAddressIndex,
			signingData,
			checkpoints,
		},
		saveData: saveSigningData,
		loginPhrase: loginId.value,
		mnemonic: mnemonic.value,
		selectedNetwork,
		listeners: {
			onChannelOpenAttempt,
			onAcceptChannel,
			onBitcoinFundingCreated,
			onAssetFundingCreated,
			sendSignedHex101035,
			onCommitmentTransactionCreated,
			on110352,
			on110353,
			sendSignedHex100363,
		},
		onMessage: console.log,
		onAddHTLC: (data: TOnCommitmentTransactionCreated): any => {
			console.log('onAddHTLC', data);
		},
		onChannelClose: (data) => console.log('onChannelClose', data),
		onClose: (data) => console.log('onClose', data),
		onCloseHTLC: (data) => console.log('onCloseHTLC', data),
		onError: (data) => console.log('onError', data),
		onForwardR: (data) => console.log('onForwardR', data),
		onOpen: (data) => console.log('onOpen', data),
		onSignR: (data) => console.log('onSignR', data),
		onChannelCloseAttempt: (data): void => {
			onChannelCloseAttempt(data);
		},
	});
};

/**accMul
 * This function is used to get accurate multiplication result.
 *
 * Explanation: There will be errors in the multiplication result of javascript,
 * which is more obvious when multiplying two floating-point numbers.
 * This function returns a more accurate multiplication result.
 *
 * @param arg1
 * @param arg2
 */
export const accMul = (arg1, arg2): number => {
	let m = 0,
		s1 = arg1.toString(),
		s2 = arg2.toString();

	try {
		m += s1.split('.')[1].length;
	} catch (e) {}

	try {
		m += s2.split('.')[1].length;
	} catch (e) {}

	return (
		(Number(s1.replace('.', '')) * Number(s2.replace('.', ''))) /
		Math.pow(10, m)
	);
};

/**
 * Auto response to -110340
 * Another party has successfully funded the channel with Bitcoin. Respond in turn.
 * @param data
 * @param [selectedNetwork]
 * @param [selectedWallet]
 */
export const onBitcoinFundingCreated: IListenerParams<
	TOnBitcoinFundingCreated,
	IBitcoinFundingSigned
> = {
	start: (): void => {},
	success: (): void => {
		const selectedWallet = getSelectedWallet();
		const selectedNetwork = getSelectedNetwork();
		updateOmniboltChannels({ selectedWallet, selectedNetwork }).then();
	},
	failure: (e): void => {
		console.log('onBitcoinFundingCreated', e);
	},
};

/**
 * Auto response to -100034 (AssetFundingCreated)
 * listening to -110034 and send -100035 AssetFundingSigned
 */
export const onAssetFundingCreated: IListenerParams<
	TOnAssetFundingCreated,
	{
		data: IAssetFundingSigned;
		funder_node_address: string;
		funder_peer_id: string;
	}
> = {
	start: (): void => {
		updateOmniboltChannels({}).then();
	},
	success: (): void => {},
	failure: (data: any): void => {
		console.log('onAssetFundingCreated', data);
	},
};

export const sendSignedHex101035: IListenerParams<
	IAssetFundingSigned,
	TSendSignedHex101035
> = {
	start: async (): Promise<void> => {
		await updateOmniboltChannels({}).then();
	},
	success: async (): Promise<void> => {
		await updateOmniboltChannels({}).then();
	},
	failure: (data): void => {
		console.log('sendSignedHex101035', data);
	},
};

/**
 * Listener for -110351 (commitmentTransactionCreated)
 * Acknowledge and accept the funder's commitment transaction.
 * @param {TOnCommitmentTransactionCreated} data
 * @param {string} channelId
 */
export const onCommitmentTransactionCreated: IListenerParams<
	TOnCommitmentTransactionCreated,
	ISendSignedHex100361Response
> = {
	start: (): void => {},
	success: (): void => {
		updateOmniboltChannels({}).then();
	},
	failure: (data): void => {
		console.log('onCommitmentTransactionCreated', data);
	},
};

/**
 * listening to -110353
 * @param e
 */
export const on110353: IListenerParams<
	TOn110353,
	ISendSignedHex100364Response
> = {
	start: (): void => {},
	success: (): void => {
		showSuccessNotification({
			title: 'Omnibolt Channel Update',
			message: 'Successfully Received Funds',
		});
		updateOmniboltChannels({}).then();
	},
	failure: (e): void => {
		console.log('on110353', e);
	},
};

/**
 * Type -100351 Protocol is used for paying omni assets by
 * Revocable Sequence Maturity Contract(RSMC) within a channel.
 * @param {string} channelId
 * @param {number} amount
 */
export const sendOmniAsset = async ({
	channelId,
	amount,
}: {
	channelId: string;
	amount: number;
}): Promise<Result<any>> => {
	try {
		const userData = getOmniboltUserData({});
		if (userData.isErr()) {
			return err(userData.error.message);
		}
		const channelPeerId = getChannelPeerId({ channelId });
		if (channelPeerId.isErr()) {
			return err(channelPeerId.error.message);
		}
		const recipient_user_peer_id = channelPeerId.value;
		//TODO: Save the recipient_node_peer_id separately when opening channels in the event the counterparty does not share the same server.
		const { nodePeerId: recipient_node_peer_id } = userData.value;

		return await obdapi.sendOmniAsset({
			channelId,
			amount,
			recipient_node_peer_id,
			recipient_user_peer_id,
		});
	} catch (e) {
		return err(e);
	}
};

/**
 * listening to -110352
 * @param {TOn110352} data
 */
export const on110352: IListenerParams<
	TOn110352,
	ISendSignedHex100363Response
> = {
	start: (): void => {},
	success: (): void => {
		showSuccessNotification({
			title: 'Omnibolt Channel Update',
			message: 'Successfully Sent Funds',
		});
		updateOmniboltChannels({}).then();
	},
	failure: (data): void => {
		console.log('on110352', data);
	},
};

export interface ISendSignedHex100363 {
	data: ISendSignedHex100362Response;
	privkey: string;
	channelId: string;
	nodeID: string;
	userID: string;
}

export const sendSignedHex100363 = {
	start: (): void => {},
	success: (): void => {
		showSuccessNotification({
			title: 'Omnibolt Channel Update',
			message: 'Successfully Sent Funds',
		});
		updateOmniboltChannels({}).then();
	},
	failure: (e): void => {
		console.log('sendSignedHex100363', e);
	},
};

/**
 * Determines whether the specified or current userPeerId is the funder of a given channel.
 * @param {string} channelId
 * @param {string} [userPeerId]
 * @param {string} [selectedWallet]
 * @param {string} [selectedNetwork]
 */
export const getIsFunder = ({
	channelId,
	userPeerId = undefined,
	selectedWallet = undefined,
	selectedNetwork = undefined,
}: {
	channelId: string;
	userPeerId?: string;
	selectedWallet?: string | undefined;
	selectedNetwork?: TAvailableNetworks | undefined;
}): Result<boolean> => {
	try {
		if (!channelId) {
			return err('No channel id provided.');
		}
		if (!selectedWallet) {
			selectedWallet = getSelectedWallet();
		}
		if (!selectedNetwork) {
			selectedNetwork = getSelectedNetwork();
		}
		let channelData: IMyChannelsData | undefined;
		try {
			channelData =
				getStore().omnibolt.wallets[selectedWallet].channels[selectedNetwork][
					channelId
				];
		} catch {}
		if (!channelData) {
			return err('Unable to find specified channel data.');
		}
		if (!userPeerId) {
			//If no userPeerId is specified assume we are using the currently stored userPeerId.
			return ok(channelData.funder);
		}
		const omniboltUserData = getOmniboltUserData({
			selectedWallet,
			selectedNetwork,
		});
		if (omniboltUserData.isErr()) {
			return err(omniboltUserData.error.message);
		}
		userPeerId = omniboltUserData.value?.userPeerId;
		return ok(channelData.peer_ida === userPeerId);
	} catch (e) {
		return err(e);
	}
};

export const getChannelData = ({
	channelId,
	selectedWallet = undefined,
	selectedNetwork = undefined,
}: {
	channelId: string;
	selectedWallet: string | undefined;
	selectedNetwork: TAvailableNetworks | undefined;
}): Result<IMyChannelsData> => {
	try {
		if (!selectedWallet) {
			selectedWallet = getSelectedWallet();
		}
		if (!selectedNetwork) {
			selectedNetwork = getSelectedNetwork();
		}
		const channelData =
			getStore().omnibolt.wallets[selectedWallet]?.channels[selectedNetwork][
				channelId
			];
		if (channelData) {
			return ok(channelData);
		}
		return err('Unable to locate channel data');
	} catch (e) {
		return err(e);
	}
};

/**
 * Returns the peer id of the counterparty for a given channelId.
 * @param {string} channelId
 * @param {string | undefined} [selectedWallet]
 * @param {TAvailableNetworks | undefined} [selectedNetwork]
 * @return {Promise<Result<string>>}
 */
export const getChannelPeerId = ({
	channelId,
	selectedWallet = undefined,
	selectedNetwork = undefined,
}: {
	channelId: string;
	selectedWallet?: string | undefined;
	selectedNetwork?: TAvailableNetworks | undefined;
}): Result<string> => {
	try {
		if (!selectedWallet) {
			selectedWallet = getSelectedWallet();
		}
		if (!selectedNetwork) {
			selectedNetwork = getSelectedNetwork();
		}
		const channelData = getChannelData({
			channelId,
			selectedWallet,
			selectedNetwork,
		});
		if (channelData.isErr()) {
			return err(channelData.error.message);
		}
		const funder = channelData.value.funder;
		let peerId: string | undefined;
		if (funder) {
			peerId = channelData.value.peer_idb;
		} else {
			peerId = channelData.value.peer_ida;
		}
		if (!peerId) {
			return err('Unable to locate channel data');
		}
		return ok(peerId);
	} catch (e) {
		return err(e);
	}
};

export interface IGetFundingAddress extends IAddressContent {
	privateKey: string;
}
export const getFundingAddress = async ({
	channelId = undefined,
	selectedWallet = undefined,
	selectedNetwork = undefined,
}: {
	channelId?: string | undefined;
	selectedWallet?: string | undefined;
	selectedNetwork?: TAvailableNetworks | undefined;
}): Promise<Result<IGetFundingAddress>> => {
	try {
		if (!channelId) {
			return err('No channelId provided.');
		}
		if (!selectedWallet) {
			selectedWallet = getSelectedWallet();
		}
		if (!selectedNetwork) {
			selectedNetwork = getSelectedNetwork();
		}
		const addressData: IAddressContent =
			getStore().omnibolt.wallets[selectedWallet].signingData[selectedNetwork][
				channelId
			].fundingAddress;
		const privKeyResult = await getPrivateKey({
			addressData,
			selectedWallet,
			selectedNetwork,
		});
		if (privKeyResult.isErr()) {
			return err(privKeyResult.error.message);
		}
		return ok({
			...addressData,
			privateKey: privKeyResult.value,
		});
	} catch (e) {
		return err(e);
	}
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
		const { nodeAddress, nodePeerId, userPeerId } =
			omniboltStore[selectedWallet]?.userData[selectedNetwork];
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
	const { address } =
		getStore().wallet.wallets[selectedWallet].utxos[selectedNetwork][0];
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
		const userData =
			getStore().omnibolt.wallets[selectedWallet].userData[selectedNetwork];
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
		const {
			nodeAddress = '',
			nodePeerId = '',
			userPeerId = '',
		} = JSON.parse(data);

		const connectPeerResponse = await obdapi.connectPeer({
			remote_node_address: nodeAddress,
		});
		if (connectPeerResponse.isErr()) {
			console.log(`Unable to connect to:\n${nodeAddress}`);
			//return err(`Unable to connect to:\n${nodeAddress}`);
		}

		const { publicKey } =
			getStore().wallet.wallets[selectedWallet].utxos[selectedNetwork][0];

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
 * Auto response to -100032 (openChannel)
 * listening to -110032 and send -100033 acceptChannel
 * @async
 * @param {TOnChannelOpenAttempt} data
 * @return {Promise<Result<TOnChannelOpenAttempt>>}
 */
export const onChannelOpenAttempt: IListenerParams<
	TOnChannelOpenAttempt,
	TOnChannelOpenAttempt
> = {
	start: (): void => {},
	success: (): void => {
		const selectedWallet = getSelectedWallet();
		const selectedNetwork = getSelectedNetwork();
		updateOmniboltChannels({ selectedWallet, selectedNetwork }).then();
	},
	failure: (e): void => {
		console.log('onChannelOpenAttempt', e);
	},
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
		addressIndex =
			getStore().omnibolt?.wallets[selectedWallet]?.addressIndex[
				selectedNetwork
			];
	} catch {}
	if (
		addressIndex &&
		addressIndex?.index >= 0 &&
		addressIndex?.path?.length > 0
	) {
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
 * @param {TOnAcceptChannel} data
 */
export const onAcceptChannel: IListenerParams<
	TOnAcceptChannel,
	TOnAcceptChannel
> = {
	start: (): void => {},
	success: (data: TOnAcceptChannel): void => {
		//Save omnibolt property id and it's data for future use/reference.
		addOmniboltAssetData(data.result.property_id).then(() => {
			updateOmniboltChannels({}).then();
		});
	},
	failure: (e): void => {
		console.log('onAcceptChannel', e);
	},
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

/**
 * Returns omnibolt signing data for the specified channel id & key.
 * @param {string} [selectedWallet]
 * @param {TAvailableNetworks} [selectedNetwork]
 * @param {string} channelId
 * @param {TSigningDataKey} [signingDataKey]
 * @return {Result<IAddressContent|string>}
 */
export const getOmniboltChannelSigningData = ({
	selectedWallet = undefined,
	selectedNetwork = undefined,
	channelId,
	signingDataKey = 'fundingAddress',
}: {
	selectedWallet?: string | undefined;
	selectedNetwork?: TAvailableNetworks | undefined;
	channelId: string;
	signingDataKey: TSigningDataKey;
}): Result<IAddressContent | string> => {
	try {
		if (!channelId) {
			return err('No channelId specified.');
		}
		if (!selectedWallet) {
			selectedWallet = getSelectedWallet();
		}
		if (!selectedNetwork) {
			selectedNetwork = getSelectedNetwork();
		}
		const signingData =
			getStore().omnibolt.wallets[selectedWallet]?.signingData[selectedNetwork][
				channelId
			][signingDataKey];
		if (!signingData) {
			return err('Unable to retrieve signingData.');
		}
		return ok(signingData);
	} catch (e) {
		return err(e);
	}
};

/**
 * Returns omnibolt signing data for the specified channel id.
 * @param {string} [selectedWallet]
 * @param {TAvailableNetworks} [selectedNetwork]
 * @param {string} channelId
 * @param {TSigningDataKey} [signingDataKey]
 * @return {Result<IAddressContent|string>}
 */
export const getSigningData = ({
	selectedWallet = undefined,
	selectedNetwork = undefined,
	channelId,
}: {
	selectedWallet?: string | undefined;
	selectedNetwork?: TAvailableNetworks | undefined;
	channelId: string;
}): Result<ISigningData> => {
	try {
		if (!channelId) {
			return err('No channelId specified.');
		}
		if (!selectedWallet) {
			selectedWallet = getSelectedWallet();
		}
		if (!selectedNetwork) {
			selectedNetwork = getSelectedNetwork();
		}
		const signingData =
			getStore().omnibolt.wallets[selectedWallet]?.signingData[selectedNetwork][
				channelId
			];
		if (!signingData) {
			return err('Unable to retrieve signingData.');
		}
		return ok(signingData);
	} catch (e) {
		return err(e);
	}
};

/**
 * Returns related data for a given omnibolt asset id.
 * @param {string} id
 * @return {Promise<Result<IGetProperty>>}
 */
export const getAssetDataById = async (
	id: string | undefined,
): Promise<Result<IGetProperty>> => {
	try {
		if (!id) {
			return err('No asset id provided.');
		}
		return await obdapi.getProperty(id);
	} catch (e) {
		return err(e);
	}
};

export const closeChannel = async ({
	recipient_node_peer_id = '',
	recipient_user_peer_id = '',
	channelId = '',
}: {
	recipient_node_peer_id: string;
	recipient_user_peer_id: string;
	channelId: string;
}): Promise<any> => {
	try {
		return await obdapi.closeChannel(
			recipient_node_peer_id,
			recipient_user_peer_id,
			channelId,
		);
	} catch (e) {
		return err(e);
	}
};

export const onChannelCloseAttempt = (data: any): void => {
	try {
		console.log(data);
	} catch (e) {
		console.log(e);
	}
};

/**
 * MsgType_HTLC_CreatedRAndHInfoList_N4001
 * @return {Promise<Result<any>>}
 */
export const getAddHTLCRandHInfoList = async (): Promise<Result<any>> => {
	try {
		return await obdapi.getAddHTLCRandHInfoList();
	} catch (e) {
		return err(e);
	}
};

/**
 * MsgType_HTLC_SignedRAndHInfoList_N4101
 * @return {Promise<Result<any>>}
 */
export const getHtlcSignedRandHInfoList = async (): Promise<Result<any>> => {
	try {
		return await obdapi.getHtlcSignedRandHInfoList();
	} catch (e) {
		return err(e);
	}
};

/**
 * MsgType_HTLC_GetRFromLCommitTx_N4103
 * @param {string} channel_id
 * @return {Promise<Result<any>>}
 */
export const getRFromCommitmentTx = async (
	channel_id,
): Promise<Result<any>> => {
	try {
		if (!channel_id) {
			return err('No channel id provided.');
		}
		return await obdapi.getRFromCommitmentTx(channel_id);
	} catch (e) {
		return err(e);
	}
};

/**
 * MsgType_HTLC_GetPathInfoByH_N4104
 * @param {string} h
 * @return {Promise<Result<any>>}
 */
export const getPathInfoByH = async (h): Promise<Result<any>> => {
	try {
		if (!h) {
			return err('Empty h.');
		}
		return await obdapi.getPathInfoByH(h);
	} catch (e) {
		return err(e);
	}
};

/**
 * MsgType_HTLC_GetRInfoByHOfOwner_N4105
 * @param {string} h
 * @return {Promise<Result<any>>}
 */
export const getRByHOfReceiver = async (h): Promise<Result<any>> => {
	try {
		if (!h) {
			return err('Empty h.');
		}
		return await obdapi.getRByHOfReceiver(h);
	} catch (e) {
		return err(e);
	}
};

/**
 * MsgType_CommitmentTx_LatestCommitmentTxByChanId_3203
 * @param {string} channel_id
 * @return {Promise<Result<any>>}
 */
export const getLatestCommitmentTransaction = async (
	channel_id,
): Promise<Result<any>> => {
	try {
		if (!channel_id) {
			return err('No channel id provided.');
		}
		return await obdapi.getLatestCommitmentTransaction(channel_id);
	} catch (e) {
		return err(e);
	}
};

/**
 * MsgType_CommitmentTx_LatestCommitmentTxByChanId_3203
 * @param {string} channel_id
 * @return {Promise<Result<any>>}
 */
export const getItemsByChannelId = async (channel_id): Promise<Result<any>> => {
	try {
		if (!channel_id) {
			return err('No channel id provided.');
		}
		return await obdapi.getItemsByChannelId(channel_id);
	} catch (e) {
		return err(e);
	}
};

/**
 * MsgType_GetMiniBtcFundAmount_2006
 * @return {Promise<Result<any>>}
 */
export const getAmountOfRechargeBTC = async (): Promise<Result<any>> => {
	try {
		return await obdapi.getAmountOfRechargeBTC();
	} catch (e) {
		return err(e);
	}
};

/**
 * MsgType_GetChannelInfoByChannelId_3154
 * @param {string} channel_id
 * @return {Promise<Result<any>>}
 */
export const getChannelDetailFromChannelID = async (
	channel_id,
): Promise<Result<any>> => {
	try {
		if (!channel_id) {
			return err('No channel id provided.');
		}
		return await obdapi.getChannelDetailFromChannelID(channel_id);
	} catch (e) {
		return err(e);
	}
};

/**
 * MsgType_GetChannelInfoByDbId_3155
 * @param {string} id
 * @return {Promise<Result<any>>}
 */
export const getChannelDetailFromDatabaseID = async (
	id,
): Promise<Result<any>> => {
	try {
		if (!id) {
			return err('No id provided.');
		}
		return await obdapi.getChannelDetailFromDatabaseID(id);
	} catch (e) {
		return err(e);
	}
};

/**
 * MsgType_CommitmentTx_AllBRByChanId_3208
 * @param {string} channel_id
 * @return {Promise<Result<any>>}
 */
export const getAllBreachRemedyTransactions = async (
	channel_id,
): Promise<Result<any>> => {
	try {
		if (!channel_id) {
			return err('No channel id provided.');
		}
		return await obdapi.getAllBreachRemedyTransactions(channel_id);
	} catch (e) {
		return err(e);
	}
};

/**
 * MsgType_CommitmentTx_ItemsByChanId_3200
 * @param {string} channel_id
 * @return {Promise<Result<any>>}
 */
export const getAllCommitmentTx = async (channel_id): Promise<Result<any>> => {
	try {
		if (!channel_id) {
			return err('No channel id provided.');
		}
		return await obdapi.getAllCommitmentTx(channel_id);
	} catch (e) {
		return err(e);
	}
};

/**
 * MsgType_CommitmentTx_LatestRDByChanId_3204
 * @param {string} channel_id
 * @return {Promise<Result<any>>}
 */
export const getLatestRevockableDeliveryTransaction = async (
	channel_id,
): Promise<Result<any>> => {
	try {
		if (!channel_id) {
			return err('No channel id provided.');
		}
		return await obdapi.getLatestRevockableDeliveryTransaction(channel_id);
	} catch (e) {
		return err(e);
	}
};

/**
 * MsgType_CommitmentTx_LatestRDByChanId_3204
 * @param {string} channel_id
 * @return {Promise<Result<any>>}
 */
export const getLatestBreachRemedyTransaction = async (
	channel_id,
): Promise<Result<any>> => {
	try {
		if (!channel_id) {
			return err('No channel id provided.');
		}
		return await obdapi.getLatestBreachRemedyTransaction(channel_id);
	} catch (e) {
		return err(e);
	}
};

/**
 * MsgType_CommitmentTx_SendSomeCommitmentById_3206
 * @param {string} id
 * @return {Promise<Result<any>>}
 */
export const sendSomeCommitmentById = async (id): Promise<Result<any>> => {
	try {
		if (!id) {
			return err('No id provided.');
		}
		return await obdapi.sendSomeCommitmentById(id);
	} catch (e) {
		return err(e);
	}
};

/**
 * MsgType_CommitmentTx_AllRDByChanId_3207
 * @param {string} channel_id
 * @return {Promise<Result<any>>}
 */
export const getAllRevockableDeliveryTransactions = async (
	channel_id,
): Promise<Result<any>> => {
	try {
		if (!channel_id) {
			return err('No channel id provided.');
		}
		return await obdapi.getAllRevockableDeliveryTransactions(channel_id);
	} catch (e) {
		return err(e);
	}
};

/**
 * MsgType_Atomic_SendSwap_80
 * @param recipient_node_peer_id string
 * @param recipient_user_peer_id string
 * @param info AtomicSwapRequest
 */
export const atomicSwap = async ({
	recipient_node_peer_id = '',
	recipient_user_peer_id = '',
	info,
}: {
	recipient_node_peer_id: string;
	recipient_user_peer_id: string;
	info: AtomicSwapRequest;
}): Promise<unknown> => {
	return await obdapi.atomicSwap(
		recipient_node_peer_id,
		recipient_user_peer_id,
		info,
	);
};

/**
 * MsgType_Atomic_SendSwapAccept_81
 * @param recipient_node_peer_id string
 * @param recipient_user_peer_id string
 * @param info AtomicSwapAccepted
 */
export const atomicSwapAccepted = async ({
	recipient_node_peer_id = '',
	recipient_user_peer_id = '',
	info,
}: {
	recipient_node_peer_id: string;
	recipient_user_peer_id: string;
	info: AtomicSwapAccepted;
}): Promise<Result<any>> => {
	return await obdapi.atomicSwapAccepted(
		recipient_node_peer_id,
		recipient_user_peer_id,
		info,
	);
};

/**
 * MsgType_CheckChannelAddessExist_3156
 * @param recipient_node_peer_id string
 * @param recipient_user_peer_id string
 * @param info AcceptChannelInfo
 */
export const checkChannelAddessExist = async ({
	recipient_node_peer_id = '',
	recipient_user_peer_id = '',
	info,
}: {
	recipient_node_peer_id: string;
	recipient_user_peer_id: string;
	info: AcceptChannelInfo;
}): Promise<unknown> => {
	if (!info) {
		return err('No info provided.');
	}
	return await obdapi.checkChannelAddessExist(
		recipient_node_peer_id,
		recipient_user_peer_id,
		info,
	);
};

/**
 * MsgType_HTLC_Invoice_402
 * @param {InvoiceInfo} info
 * @return {Promise<Result<any>>}
 */
export const addInvoice = async (info: InvoiceInfo): Promise<Result<any>> => {
	try {
		if (!info) {
			return err('No invoice info provided.');
		}
		return await obdapi.addInvoice(info);
	} catch (e) {
		return err(e);
	}
};

/**
 * MsgType_HTLC_Invoice_402
 * @param {HTLCFindPathInfo} info
 * @return {Promise<Result<any>>}
 */
export const HTLCFindPath = async (
	info: HTLCFindPathInfo,
): Promise<unknown> => {
	try {
		if (!info) {
			return err('No info provided.');
		}
		return await obdapi.HTLCFindPath(info);
	} catch (e) {
		return err(e);
	}
};

/**
 * MsgType_HTLC_SendAddHTLC_40
 * @param recipient_node_peer_id string
 * @param recipient_user_peer_id string
 * @param info addHTLCInfo
 */
export const addHTLC = async ({
	recipient_node_peer_id = '',
	recipient_user_peer_id = '',
	info,
}: {
	recipient_node_peer_id: string;
	recipient_user_peer_id: string;
	info: addHTLCInfo;
}): Promise<unknown> => {
	if (!info) {
		return err('No info provided.');
	}
	return await obdapi.addHTLC(
		recipient_node_peer_id,
		recipient_user_peer_id,
		info,
	);
};

/**
 * MsgType_HTLC_SendAddHTLCSigned_41
 * @param recipient_node_peer_id string
 * @param recipient_user_peer_id string
 * @param info HtlcSignedInfo
 */
export const htlcSigned = async ({
	recipient_node_peer_id = '',
	recipient_user_peer_id = '',
	info,
}: {
	recipient_node_peer_id: string;
	recipient_user_peer_id: string;
	info: HtlcSignedInfo;
}): Promise<unknown> => {
	if (!info) {
		return err('No info provided.');
	}
	return await obdapi.htlcSigned(
		recipient_node_peer_id,
		recipient_user_peer_id,
		info,
	);
};

/**
 * MsgType_HTLC_SendVerifyR_45
 * @param recipient_node_peer_id string
 * @param recipient_user_peer_id string
 * @param info ForwardRInfo
 */
export const forwardR = async ({
	recipient_node_peer_id = '',
	recipient_user_peer_id = '',
	info,
}: {
	recipient_node_peer_id: string;
	recipient_user_peer_id: string;
	info: ForwardRInfo;
}): Promise<unknown> => {
	if (!info) {
		return err('No info provided.');
	}
	return await obdapi.forwardR(
		recipient_node_peer_id,
		recipient_user_peer_id,
		info,
	);
};

/**
 * MsgType_HTLC_SendSignVerifyR_46
 * @param recipient_node_peer_id string
 * @param recipient_user_peer_id string
 * @param info SignRInfo
 */
export const signR = async ({
	recipient_node_peer_id = '',
	recipient_user_peer_id = '',
	info,
}: {
	recipient_node_peer_id: string;
	recipient_user_peer_id: string;
	info: SignRInfo;
}): Promise<unknown> => {
	if (!info) {
		return err('No info provided.');
	}
	return await obdapi.signR(
		recipient_node_peer_id,
		recipient_user_peer_id,
		info,
	);
};

/**
 * MsgType_HTLC_SendRequestCloseCurrTx_49
 * @param recipient_node_peer_id string
 * @param recipient_user_peer_id string
 * @param info CloseHtlcTxInfo
 */
export const closeHTLC = async ({
	recipient_node_peer_id = '',
	recipient_user_peer_id = '',
	info,
}: {
	recipient_node_peer_id: string;
	recipient_user_peer_id: string;
	info: CloseHtlcTxInfo;
}): Promise<unknown> => {
	if (!info) {
		return err('No info provided.');
	}
	return await obdapi.closeHTLC(
		recipient_node_peer_id,
		recipient_user_peer_id,
		info,
	);
};

/**
 * MsgType_HTLC_SendCloseSigned_50
 * @param recipient_node_peer_id string
 * @param recipient_user_peer_id string
 * @param info CloseHtlcTxInfoSigned
 */
export const closeHTLCSigned = async ({
	recipient_node_peer_id = '',
	recipient_user_peer_id = '',
	info,
}: {
	recipient_node_peer_id: string;
	recipient_user_peer_id: string;
	info: CloseHtlcTxInfoSigned;
}): Promise<unknown> => {
	if (!info) {
		return err('No info provided.');
	}
	return await obdapi.closeHTLCSigned(
		recipient_node_peer_id,
		recipient_user_peer_id,
		info,
	);
};

/**
 * MsgType_Core_Omni_CreateNewTokenFixed_2113
 * @param info IssueFixedAmountInfo
 */
export const issueFixedAmount = async ({
	info,
}: {
	recipient_node_peer_id: string;
	recipient_user_peer_id: string;
	info: IssueFixedAmountInfo;
}): Promise<unknown> => {
	if (!info) {
		return err('No info provided.');
	}
	return await obdapi.issueFixedAmount(info);
};

/**
 * MsgType_Core_Omni_CreateNewTokenManaged_2114
 * @param info IssueManagedAmoutInfo
 */
export const issueManagedAmout = async ({
	info,
}: {
	info: IssueManagedAmoutInfo;
}): Promise<unknown> => {
	if (!info) {
		return err('No info provided.');
	}
	return await obdapi.issueManagedAmout(info);
};

/**
 * MsgType_Core_Omni_GrantNewUnitsOfManagedToken_2115
 * @param info OmniSendGrant
 */
export const sendGrant = async ({
	info,
}: {
	info: OmniSendGrant;
}): Promise<unknown> => {
	if (!info) {
		return err('No info provided.');
	}
	return await obdapi.sendGrant(info);
};

/**
 * MsgType_Core_Omni_RevokeUnitsOfManagedToken_2116
 * @param info OmniSendRevoke
 */
export const sendRevoke = async ({
	info,
}: {
	info: OmniSendRevoke;
}): Promise<unknown> => {
	if (!info) {
		return err('No info provided.');
	}
	return await obdapi.sendRevoke(info);
};

/**
 * MsgType_Core_Omni_Getbalance_2112
 * @param address string
 * @param callback function
 */
export const getAllBalancesForAddress = async ({
	address,
}: {
	address: string;
}): Promise<unknown> => {
	if (!address) {
		return err('No address provided.');
	}
	return await obdapi.getAllBalancesForAddress(address);
};
