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
	IAssetFundingSigned,
	IBitcoinFundingSigned,
	IConnect,
	IFundingBitcoin,
	IGetMyChannels,
	ILogin,
	TOnAssetFundingCreated,
	TOnBitcoinFundingCreated,
	TOnChannelOpenAttempt,
	TOnCommitmentTransactionCreated,
	TSendSignedHex101035,
} from 'omnibolt-js/lib/types/types';
import {
	generateAddresses,
	generateMnemonic,
	getCurrentWallet,
	getKeyDerivationPath,
	getPrivateKey,
	getSelectedNetwork,
	getSelectedWallet,
} from '../wallet';
import {
	addOmniboltAddress,
	clearOmniboltCheckpoint,
	connectToOmnibolt,
	loginToOmnibolt,
	renameOmniboltChannelId,
	updateOmniboltChannels,
	updateOmniboltChannelSigningData,
	updateOmniboltCheckpoint,
} from '../../store/actions/omnibolt';
import {
	IOmniboltConnectData,
	IOmniBoltUserData,
	ISigningData,
	TSigningDataKey,
} from '../../store/types/omnibolt';
import { networks, TAvailableNetworks } from '../networks';
import {
	IssueFixedAmountInfo,
	OpenChannelInfo,
	SignedInfo101035,
} from 'omnibolt-js/lib/types/pojo';
import { IAddressContent } from '../../store/types/wallet';
import { resumeFromCheckpoints } from './checkpoints';
import { IMyChannelsData } from '../../store/shapes/omnibolt';

const bitcoin = require('bitcoinjs-lib');
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
		onMessage: console.log,
		onBitcoinFundingCreated: (data: TOnBitcoinFundingCreated) => {
			updateOmniboltCheckpoint({
				channelId: data.result.sign_data.temporary_channel_id,
				checkpoint: 'onBitcoinFundingCreated',
				data,
			}).then();
			onBitcoinFundingCreated({ data });
		},
		onAssetFundingCreated: (data: TOnAssetFundingCreated): void => {
			updateOmniboltCheckpoint({
				channelId: data.result.sign_data.temporary_channel_id,
				checkpoint: 'onAssetFundingCreated',
				data,
			}).then();
			onAssetFundingCreated({ data });
		},
		onCommitmentTransactionCreated: (
			data: TOnCommitmentTransactionCreated,
		): void => {
			updateOmniboltCheckpoint({
				channelId: data.result.channel_id,
				checkpoint: 'onCommitmentTransactionCreated',
				data,
			}).then();
			onCommitmentTransactionCreated({
				data,
				channelId: data.result.channel_id,
			});
		},
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

interface ISignP2SH {
	is_first_sign: boolean;
	txhex: string;
	pubkey_1: string;
	pubkey_2: string;
	privkey: string;
	inputs: any;
	selectedNetwork?: TAvailableNetworks | undefined;
}

/**
 * Sign P2SH address with TransactionBuilder way for 2-2 multi-sig address
 * @param is_first_sign  Is the first person to sign this transaction?
 * @param txhex
 * @param pubkey_1
 * @param pubkey_2
 * @param privkey
 * @param inputs    all of inputs
 * @param selectedNetwork
 */
//TODO: Remove TransactionBuilder and work into existing signing logic.
export const signP2SH = async ({
	is_first_sign,
	txhex,
	pubkey_1,
	pubkey_2,
	privkey,
	inputs,
	selectedNetwork,
}: ISignP2SH): Promise<string> => {
	if (txhex === '') {
		return '';
	}
	if (!selectedNetwork) {
		selectedNetwork = getSelectedNetwork();
	}

	const network = networks[selectedNetwork];
	const tx = bitcoin.Transaction.fromHex(txhex);
	const txb = bitcoin.TransactionBuilder.fromTransaction(tx, network);
	const pubkeys = [pubkey_1, pubkey_2].map((hex) => Buffer.from(hex, 'hex'));
	const p2ms = bitcoin.payments.p2ms({ m: 2, pubkeys, network });
	const p2sh = bitcoin.payments.p2sh({ redeem: p2ms, network });
	// private key
	const key = bitcoin.ECPair.fromWIF(privkey, network);

	// Sign all inputs
	for (let i = 0; i < inputs.length; i++) {
		let amount = accMul(inputs[i].amount, 100000000);
		txb.sign(i, key, p2sh.redeem.output, undefined, amount, undefined);
	}

	if (is_first_sign === true) {
		// The first person to sign this transaction
		let firstHex = txb.buildIncomplete().toHex();
		console.info('First signed - Hex => ' + firstHex);
		return firstHex;
	} else {
		// The second person to sign this transaction
		let finalHex = txb.build().toHex();
		console.info('signP2SH - Second signed - Hex = ' + finalHex);
		return finalHex;
	}
};

/**
 * Another party has successfully funded the channel with Bitcoin. Respond in turn.
 * @param data
 * @param [selectedNetwork]
 * @param [selectedWallet]
 */
export const onBitcoinFundingCreated = async ({
	data,
	selectedNetwork = undefined,
	selectedWallet = undefined,
}: {
	data: TOnBitcoinFundingCreated;
	selectedWallet?: string | undefined;
	selectedNetwork?: TAvailableNetworks | undefined;
}): Promise<Result<IBitcoinFundingSigned>> => {
	if (!selectedWallet) {
		selectedWallet = getSelectedWallet();
	}
	if (!selectedNetwork) {
		selectedNetwork = getSelectedNetwork();
	}
	const tempChannelId = data.result.sign_data.temporary_channel_id;
	const signingData: ISigningData = getStore().omnibolt.wallets[selectedWallet]
		.signingData[selectedNetwork][tempChannelId];
	const fundingAddress = signingData.fundingAddress;
	const privkey = await getPrivateKey({
		addressData: fundingAddress,
		selectedNetwork,
		selectedWallet,
	});
	if (privkey.isErr()) {
		return err(privkey.error.message);
	}
	const { funder_node_address, funder_peer_id, sign_data } = data.result;
	const signed_hex = await signP2SH({
		is_first_sign: false,
		txhex: sign_data.hex,
		pubkey_1: sign_data.pub_key_a,
		pubkey_2: fundingAddress.publicKey,
		privkey: privkey.value,
		inputs: sign_data.inputs,
		selectedNetwork,
	});
	const txid = sign_data.inputs[0].txid;
	const response = await obdapi.bitcoinFundingSigned(
		funder_node_address,
		funder_peer_id,
		{
			temporary_channel_id: tempChannelId,
			funding_txid: txid,
			approval: true,
			signed_miner_redeem_transaction_hex: signed_hex,
		},
	);
	if (response.isErr()) {
		return err(response.error.message);
	}
	//Clear checkpoint
	await clearOmniboltCheckpoint({
		selectedWallet,
		selectedNetwork,
		channelId: tempChannelId,
	});
	return ok(response.value);
};

export const onAssetFundingCreated = async ({
	data,
	selectedNetwork = undefined,
	selectedWallet = undefined,
}: {
	data: TOnAssetFundingCreated;
	selectedWallet?: string | undefined;
	selectedNetwork?: TAvailableNetworks | undefined;
}): Promise<Result<any>> => {
	try {
		if (!selectedWallet) {
			selectedWallet = getSelectedWallet();
		}
		if (!selectedNetwork) {
			selectedNetwork = getSelectedNetwork();
		}
		const tempChannelId = data.result.sign_data.temporary_channel_id;
		const signingData: ISigningData = getStore().omnibolt.wallets[
			selectedWallet
		].signingData[selectedNetwork][tempChannelId];
		const fundingAddress = signingData.fundingAddress;
		const privkey = await getPrivateKey({
			addressData: fundingAddress,
			selectedNetwork,
			selectedWallet,
		});
		if (privkey.isErr()) {
			return err(privkey.error.message);
		}
		const { funder_node_address, funder_peer_id, sign_data } = data.result;
		const signed_hex = await signP2SH({
			is_first_sign: false,
			txhex: sign_data.hex,
			pubkey_1: sign_data.pub_key_a,
			pubkey_2: sign_data.pub_key_b,
			privkey: privkey.value,
			inputs: sign_data.inputs,
			selectedNetwork,
		});
		const response = await obdapi.assetFundingSigned(
			funder_node_address,
			funder_peer_id,
			{
				temporary_channel_id: tempChannelId,
				signed_alice_rsmc_hex: signed_hex,
			},
		);
		if (response.isErr()) {
			return err(response.error.message);
		}
		await updateOmniboltCheckpoint({
			selectedWallet,
			selectedNetwork,
			checkpoint: 'sendSignedHex101035',
			channelId: tempChannelId,
			data: {
				funder_node_address,
				funder_peer_id,
				result: response.value,
			},
		});
		const sendSignedResponse = await sendSignedHex101035({
			data: response.value,
			channelId: tempChannelId,
			funder_node_address,
			funder_peer_id,
		});
		if (sendSignedResponse.isErr()) {
			return err(sendSignedResponse.error.message);
		}
		//Clear checkpoints and update all temp channel id's to the newly provided channel id.
		await Promise.all([
			clearOmniboltCheckpoint({
				channelId: tempChannelId,
				selectedWallet,
				selectedNetwork,
			}),
			renameOmniboltChannelId({
				oldChannelId: tempChannelId,
				newChannelId: sendSignedResponse.value.result.channel_id,
				selectedWallet,
				selectedNetwork,
			}),
		]);
		await updateOmniboltChannels({
			selectedWallet,
			selectedNetwork,
		});
		await clearOmniboltCheckpoint({
			channelId: tempChannelId,
			selectedWallet,
			selectedNetwork,
		});
		return sendSignedResponse;
	} catch (e) {
		return err(e);
	}
};

export const sendSignedHex101035 = async ({
	data,
	channelId,
	funder_node_address,
	funder_peer_id,
}: {
	data: IAssetFundingSigned;
	channelId: string;
	funder_node_address: string;
	funder_peer_id: string;
}): Promise<Result<TSendSignedHex101035>> => {
	try {
		const channel_id = channelId;
		// Bob sign the tx on client side
		// NO.1 alice_br_sign_data
		let br = data.alice_br_sign_data;
		let inputs = br.inputs;
		let fundingAddressResponse = await getFundingAddress({
			channelId,
		});
		if (fundingAddressResponse.isErr()) {
			return err(fundingAddressResponse.error.message);
		}
		let privkey = fundingAddressResponse.value.privateKey;
		let br_hex = await signP2SH({
			is_first_sign: true,
			txhex: br.hex,
			pubkey_1: br.pub_key_a,
			pubkey_2: br.pub_key_b,
			privkey,
			inputs,
		});

		// NO.2 alice_rd_sign_data
		let rd = data.alice_rd_sign_data;
		inputs = rd.inputs;
		let rd_hex = await signP2SH({
			is_first_sign: true,
			txhex: rd.hex,
			pubkey_1: rd.pub_key_a,
			pubkey_2: rd.pub_key_b,
			privkey,
			inputs,
		});

		// will send 101035
		let signedInfo: SignedInfo101035 = {
			temporary_channel_id: '',
			rd_signed_hex: '',
			br_signed_hex: '',
			br_id: 0,
		};
		signedInfo.temporary_channel_id = channel_id;
		signedInfo.br_signed_hex = br_hex;
		signedInfo.rd_signed_hex = rd_hex;
		signedInfo.br_id = br.br_id;

		return await obdapi.sendSignedHex101035(
			funder_node_address,
			funder_peer_id,
			signedInfo,
		);
	} catch (e) {
		return err(e);
	}
};

/**
 * Listener for -110351
 * Acknowledge and accept the funder's commitment transaction.
 * @param {TOnCommitmentTransactionCreated} data
 * @param {string} channelId
 */
export const onCommitmentTransactionCreated = ({
	data,
	channelId,
}: {
	data: TOnCommitmentTransactionCreated;
	channelId: string;
}): void => {
	console.log('onCommitmentTransactionCreatedData', data);
	console.log('channelId', channelId);
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
			channelData = getStore().omnibolt.wallets[selectedWallet].channels[
				selectedNetwork
			][channelId];
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
		const addressData: IAddressContent = getStore().omnibolt.wallets[
			selectedWallet
		].signingData[selectedNetwork][channelId].fundingAddress;
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

		await resumeFromCheckpoints();

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
 * @param {TOnChannelOpenAttempt} data
 * @return {Promise<Result<TOnChannelOpenAttempt>>}
 */
export const onChannelOpenAttempt = async (
	data: TOnChannelOpenAttempt,
): Promise<Result<TOnChannelOpenAttempt>> => {
	await addOmniboltAddress({});
	const {
		funder_node_address,
		funder_peer_id,
		temporary_channel_id,
	} = data.result;
	const selectedWallet = getSelectedWallet();
	const selectedNetwork = getSelectedNetwork();
	const channelAddress = getStore().omnibolt.wallets[selectedWallet]
		.addressIndex[selectedNetwork];
	const funding_pubkey = channelAddress.publicKey;
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
	await Promise.all([
		updateOmniboltChannels({}),
		addOmniboltAddress({ selectedWallet, selectedNetwork }),
		updateOmniboltChannelSigningData({
			selectedWallet,
			selectedNetwork,
			channelId: temporary_channel_id,
			signingDataKey: 'fundingAddress',
			signingData: channelAddress,
		}),
	]);
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

/**
 * Returns omnibolt signing data for the speciied channel id & key.
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
	selectedWallet: string | undefined;
	selectedNetwork: TAvailableNetworks | undefined;
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
		const signingData = getStore().omnibolt.wallets[selectedWallet]
			?.signingData[selectedNetwork][channelId][signingDataKey];
		if (!signingData) {
			return err('Unable to retrieve signingData.');
		}
		return signingData;
	} catch (e) {
		return err(e);
	}
};
