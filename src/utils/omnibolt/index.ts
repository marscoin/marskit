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
	ICommitmentTransactionAcceptedResponse,
	IConnect,
	IFundingBitcoin,
	IGetMyChannels,
	ILogin,
	ISendSignedHex100361Response,
	ISendSignedHex100363Response,
	ISendSignedHex101035,
	TOn110352,
	TOn110353,
	TOnAcceptChannel,
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
	updateOmniboltCheckpoint,
	updateSigningData,
} from '../../store/actions/omnibolt';
import {
	IOmniboltConnectData,
	IOmniBoltUserData,
	ISigningData,
	TSigningDataKey,
} from '../../store/types/omnibolt';
import { networks, TAvailableNetworks } from '../networks';
import {
	CommitmentTx,
	CommitmentTxSigned,
	IssueFixedAmountInfo,
	OpenChannelInfo,
	SignedInfo100360,
	SignedInfo100361,
	SignedInfo100362,
	SignedInfo100363,
	SignedInfo100364,
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
		onChannelOpenAttempt: (data) => {
			//Auto response to -110032
			//Save data at checkpoint and attempt to accept the channel later.
			updateOmniboltCheckpoint({
				channelId: data.result.temporary_channel_id,
				checkpoint: 'onChannelOpenAttempt',
				data,
			}).then();
			console.log('onChannelOpenAttempt', data);
			onChannelOpenAttempt(data);
		},
		onAcceptChannel: (data) => {
			//TODO: This checkpoint is probably not needed, but being included anyway for the time being.
			updateOmniboltCheckpoint({
				channelId: data.result.temporary_channel_id,
				checkpoint: 'onAcceptChannel',
				data,
			}).then();
			console.log('onAcceptChannel', data);
			onAcceptChannel(data);
		},
		onMessage: console.log,
		onBitcoinFundingCreated: (data: TOnBitcoinFundingCreated) => {
			//Auto response to -110340
			updateOmniboltCheckpoint({
				channelId: data.result.sign_data.temporary_channel_id,
				checkpoint: 'onBitcoinFundingCreated',
				data,
			}).then();
			console.log('onBitcoinFundingCreated', data);
			onBitcoinFundingCreated({ data });
		},
		onAssetFundingCreated: (data: TOnAssetFundingCreated): void => {
			//Auto response to -110034
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
			//Auto response to -110351
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
		on110353: (data: TOn110353): void => {
			//Auto response to -110353
			updateOmniboltCheckpoint({
				channelId: data.result.channel_id,
				checkpoint: 'on110353',
				data,
			}).then();
			on110353(data);
		},
		on110352: (data: TOn110352): void => {
			//Auto response to -110352
			updateOmniboltCheckpoint({
				channelId: data.result.channel_id,
				checkpoint: 'on110352',
				data,
			}).then();
			on110352(data);
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
 * Auto response to -110340
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
	const signingData: ISigningData =
		getStore().omnibolt.wallets[selectedWallet].signingData[selectedNetwork][
			tempChannelId
		];
	const fundingAddress = signingData.addressIndex;
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
	const txid = data.result.funding_txid;
	const info = {
		temporary_channel_id: tempChannelId,
		funding_txid: txid,
		approval: true,
		signed_miner_redeem_transaction_hex: signed_hex,
	};
	const response = await obdapi.bitcoinFundingSigned(
		funder_node_address,
		funder_peer_id,
		info,
	);
	if (response.isErr()) {
		return err(response.error.message);
	}
	//Save signing data if successful.
	await Promise.all([
		updateSigningData({
			channelId: tempChannelId,
			signingDataKey: 'kTbSignedHex',
			signingData: signed_hex,
		}),
		await updateSigningData({
			channelId: tempChannelId,
			signingDataKey: 'funding_txid',
			signingData: txid,
		}),
	]);
	//Clear checkpoint
	await clearOmniboltCheckpoint({
		selectedWallet,
		selectedNetwork,
		channelId: tempChannelId,
	});
	return ok(response.value);
};

/**
 * Auto response to -100034 (AssetFundingCreated)
 * listening to -110034 and send -100035 AssetFundingSigned
 * @param {TOnAssetFundingCreated} data
 * @param {TAvailableNetworks | undefined} [selectedNetwork]
 * @param {string | undefined} [selectedWallet]
 */
export const onAssetFundingCreated = async ({
	data,
	selectedNetwork = undefined,
	selectedWallet = undefined,
}: {
	data: TOnAssetFundingCreated;
	selectedWallet?: string | undefined;
	selectedNetwork?: TAvailableNetworks | undefined;
}): Promise<Result<ISendSignedHex101035>> => {
	try {
		if (!selectedWallet) {
			selectedWallet = getSelectedWallet();
		}
		if (!selectedNetwork) {
			selectedNetwork = getSelectedNetwork();
		}

		const tempChannelId = data.result.sign_data.temporary_channel_id;
		const signingData: ISigningData =
			getStore().omnibolt.wallets[selectedWallet].signingData[selectedNetwork][
				tempChannelId
			];
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
		const info = {
			temporary_channel_id: tempChannelId,
			signed_alice_rsmc_hex: signed_hex,
		};

		const response = await obdapi.assetFundingSigned(
			funder_node_address,
			funder_peer_id,
			info,
		);
		if (response.isErr()) {
			return err(response.error.message);
		}

		await Promise.all([
			updateSigningData({
				channelId: tempChannelId,
				signingDataKey: 'kTbSignedHex',
				signingData: signed_hex,
			}),
			updateOmniboltCheckpoint({
				selectedWallet,
				selectedNetwork,
				checkpoint: 'sendSignedHex101035',
				channelId: tempChannelId,
				data: {
					funder_node_address,
					funder_peer_id,
					result: response.value,
				},
			}),
		]);

		return await sendSignedHex101035({
			data: response.value,
			channelId: tempChannelId,
			funder_node_address,
			funder_peer_id,
			selectedWallet,
			selectedNetwork,
		});
	} catch (e) {
		return err(e);
	}
};

export const sendSignedHex101035 = async ({
	data,
	channelId,
	funder_node_address,
	funder_peer_id,
	selectedWallet = undefined,
	selectedNetwork = undefined,
}: {
	data: IAssetFundingSigned;
	channelId: string;
	funder_node_address: string;
	funder_peer_id: string;
	selectedWallet?: string | undefined;
	selectedNetwork?: TAvailableNetworks | undefined;
}): Promise<Result<TSendSignedHex101035>> => {
	try {
		if (!selectedWallet) {
			selectedWallet = getSelectedWallet();
		}
		if (!selectedNetwork) {
			selectedNetwork = getSelectedNetwork();
		}
		const channel_id = channelId;
		// Bob sign the tx on client side
		// NO.1 alice_br_sign_data
		let br = data.alice_br_sign_data;
		let inputs = br.inputs;
		const signingDataResponse = getSigningData({ channelId });
		if (signingDataResponse.isErr()) {
			return err(signingDataResponse.error.message);
		}
		const signingData = signingDataResponse.value;
		let privkeyResponse = await getPrivateKey({
			addressData: signingData.fundingAddress,
		});
		if (privkeyResponse.isErr()) {
			return err(privkeyResponse.error.message);
		}
		const privkey = privkeyResponse.value;
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
		const signedInfo: SignedInfo101035 = {
			temporary_channel_id: channel_id,
			rd_signed_hex: rd_hex,
			br_signed_hex: br_hex,
			br_id: br.br_id,
		};

		const sendSignedResponse = await obdapi.sendSignedHex101035(
			funder_node_address,
			funder_peer_id,
			signedInfo,
		);

		if (sendSignedResponse.isErr()) {
			return err(sendSignedResponse.error.message);
		}

		await Promise.all([
			renameOmniboltChannelId({
				oldChannelId: channelId,
				newChannelId: sendSignedResponse.value.channel_id,
				selectedWallet,
				selectedNetwork,
			}),
		]);
		//Clear checkpoints and update all temp channel id's to the newly provided channel id.
		await Promise.all([
			clearOmniboltCheckpoint({
				channelId,
				selectedWallet,
				selectedNetwork,
			}),
		]);
		await updateOmniboltChannels({
			selectedWallet,
			selectedNetwork,
		});
		return sendSignedResponse;
	} catch (e) {
		return err(e);
	}
};

/**
 * Listener for -110351 (commitmentTransactionCreated)
 * Acknowledge and accept the funder's commitment transaction.
 * @param {TOnCommitmentTransactionCreated} data
 * @param {string} channelId
 */
export const onCommitmentTransactionCreated = async ({
	data,
	channelId,
}: {
	data: TOnCommitmentTransactionCreated;
	channelId: string;
}): Promise<Result<ISendSignedHex100361Response>> => {
	const isFunder = getIsFunder({ channelId });
	if (isFunder.isErr()) {
		return err(isFunder.error.message);
	}

	// Receiver sign the tx on client side
	// NO.1 counterparty_raw_data
	const cr = data.result.counterparty_raw_data;
	const crInputs = cr.inputs;

	const signingDataResponse = await getSigningData({ channelId });
	if (signingDataResponse.isErr()) {
		return err(signingDataResponse.error.message);
	}
	const signingData = signingDataResponse.value;
	const privKeyResponse = await getPrivateKey({
		addressData: signingData.fundingAddress,
	});
	if (privKeyResponse.isErr()) {
		return err(privKeyResponse.error.message);
	}
	const fundingPrivateKey = privKeyResponse.value;

	let cr_hex = await signP2SH({
		is_first_sign: false,
		txhex: cr.hex,
		pubkey_1: cr.pub_key_a,
		pubkey_2: cr.pub_key_b,
		privkey: fundingPrivateKey,
		inputs: crInputs,
	});

	// NO.2 rsmc_raw_data
	let rr = data.result.rsmc_raw_data;
	const rrInputs = rr.inputs;
	let rr_hex = await signP2SH({
		is_first_sign: false,
		txhex: rr.hex,
		pubkey_1: rr.pub_key_a,
		pubkey_2: rr.pub_key_b,
		privkey: fundingPrivateKey,
		inputs: rrInputs,
	});

	await Promise.all([
		updateSigningData({
			channelId,
			signingDataKey: 'kTbSignedHexCR110351',
			signingData: cr_hex,
		}),
		updateSigningData({
			channelId,
			signingDataKey: 'kTbSignedHexRR110351',
			signingData: rr_hex,
		}),
	]);

	let nodeID = data.result.payer_node_address;
	let userID = data.result.payer_peer_id;

	const addressIndexResponse = await getNextOmniboltAddress({});
	if (addressIndexResponse.isErr()) {
		return err(addressIndexResponse.error.message);
	}
	const newAddressIndex = addressIndexResponse.value;
	const newAddressIndexPrivKey = await getPrivateKey({
		addressData: newAddressIndex,
	});
	if (newAddressIndexPrivKey.isErr()) {
		return err(newAddressIndexPrivKey.error.message);
	}
	let newTempPrivKey = newAddressIndexPrivKey.value || '';
	let lastTempPrivKey = signingData?.kTempPrivKey || '';

	// will send -100352 commitmentTransactionAccepted
	let info: CommitmentTxSigned = {
		channel_id: channelId,
		msg_hash: data.result.msg_hash,
		c2a_rsmc_signed_hex: rr_hex,
		c2a_counterparty_signed_hex: cr_hex,
		curr_temp_address_pub_key: newAddressIndex.publicKey,
		last_temp_address_private_key: lastTempPrivKey,
		approval: true,
		// Save address index to OBD and can get private key back if lose it.
		curr_temp_address_index: newAddressIndex.index,
	};
	const commitmentTransactionAcceptedResponse =
		await obdapi.commitmentTransactionAccepted(nodeID, userID, info);

	if (commitmentTransactionAcceptedResponse.isErr()) {
		return err(commitmentTransactionAcceptedResponse.error.message);
	}

	const checkpointData = {
		info: commitmentTransactionAcceptedResponse.value,
		userID,
		nodeID,
	};

	await updateOmniboltCheckpoint({
		channelId,
		data: checkpointData,
		checkpoint: 'commitmentTransactionAccepted',
	});

	const commitTxResponse = await commitmentTransactionAccepted(checkpointData);
	if (commitTxResponse.isErr()) {
		return err(commitTxResponse.error.message);
	}

	//TODO: Maybe these should come before commitTxResponse?
	await Promise.all([
		updateSigningData({
			channelId,
			signingDataKey: 'addressIndex',
			signingData: newAddressIndex,
		}),
		updateSigningData({
			channelId,
			signingDataKey: 'kTempPrivKey',
			signingData: newTempPrivKey,
		}),
		addOmniboltAddress({}),
	]);

	return ok(commitTxResponse.value);
};

export interface ICommitmentTransactionAcceptedCheckpointData {
	info: ICommitmentTransactionAcceptedResponse;
	nodeID: string;
	userID: string;
}

/**
 * Type -100352 Protocol is used to Receiver revokes the previous
 * commitment transaction and ackonwledge the new transaction.
 * @param info
 * @param userID
 * @param nodeID
 */
export const commitmentTransactionAccepted = async ({
	info,
	userID,
	nodeID,
}: ICommitmentTransactionAcceptedCheckpointData): Promise<
	Result<ISendSignedHex100361Response>
> => {
	try {
		const e = info;
		// Receiver sign the tx on client side
		// NO.1 c2a_br_raw_data
		let ab = e.c2a_br_raw_data;
		let inputs = ab.inputs;

		const signingDataResponse = getSigningData({ channelId: e.channel_id });
		if (signingDataResponse.isErr()) {
			return err(signingDataResponse.error.message);
		}
		const signingData = signingDataResponse.value;
		const { fundingAddress } = signingData;
		const fundingPrivKey = await getPrivateKey({
			addressData: fundingAddress,
		});
		if (fundingPrivKey.isErr()) {
			return err(fundingPrivKey.error.message);
		}
		let privkey = fundingPrivKey.value;
		let ab_hex = await signP2SH({
			is_first_sign: true,
			txhex: ab.hex,
			pubkey_1: ab.pub_key_a,
			pubkey_2: ab.pub_key_b,
			privkey,
			inputs,
		});

		// NO.2 c2a_rd_raw_data
		let ar = e.c2a_rd_raw_data;
		inputs = ar.inputs;
		let ar_hex = await signP2SH({
			is_first_sign: true,
			txhex: ar.hex,
			pubkey_1: ar.pub_key_a,
			pubkey_2: ar.pub_key_b,
			privkey,
			inputs,
		});

		// NO.3 c2b_counterparty_raw_data
		let bc = e.c2b_counterparty_raw_data;
		inputs = bc.inputs;
		let bc_hex = await signP2SH({
			is_first_sign: true,
			txhex: bc.hex,
			pubkey_1: bc.pub_key_a,
			pubkey_2: bc.pub_key_b,
			privkey,
			inputs,
		});

		// NO.4 c2b_rsmc_raw_data
		let br = e.c2b_rsmc_raw_data;
		inputs = br.inputs;
		let br_hex = await signP2SH({
			is_first_sign: true,
			txhex: br.hex,
			pubkey_1: br.pub_key_a,
			pubkey_2: br.pub_key_b,
			privkey,
			inputs,
		});

		// will send 100361
		let signedInfo: SignedInfo100361 = {
			channel_id: e.channel_id,
			c2b_rsmc_signed_hex: br_hex,
			c2b_counterparty_signed_hex: bc_hex,
			c2a_rd_signed_hex: ar_hex,
			c2a_br_signed_hex: ab_hex,
			c2a_br_id: ab.br_id,
		};

		const sendSignedHex100361Response = await obdapi.sendSignedHex100361(
			nodeID,
			userID,
			signedInfo,
		);

		if (sendSignedHex100361Response.isErr()) {
			return err(sendSignedHex100361Response.error.message);
		}

		await updateSigningData({
			channelId: e.channel_id,
			signingDataKey: 'kTempPrivKey',
			signingData: privkey,
		});
		//saveTempPrivKey(myUserID, kTempPrivKey, e.channel_id, newTempPrivKey);

		await clearOmniboltCheckpoint({
			channelId: e.channel_id,
		});

		return ok(sendSignedHex100361Response.value);
	} catch (e) {
		console.log(e);
		return err(e);
	}
};

/**
 * listening to -110353
 * @param e
 */
export const on110353 = async (e: TOn110353): Promise<unknown> => {
	// Receiver sign the tx on client side
	let rd = e.result.c2b_rd_partial_data;
	let inputs = rd.inputs;
	const signingDataResponse = getSigningData({
		channelId: e.result.channel_id,
	});
	if (signingDataResponse.isErr()) {
		return err(signingDataResponse.error.message);
	}
	const privKeyResponse = await getPrivateKey({
		addressData: signingDataResponse.value.addressIndex,
	});
	if (privKeyResponse.isErr()) {
		return err(privKeyResponse.error.message);
	}
	//let tempKey = getTempPrivKey(e.to_peer_id, kTempPrivKey, e.channel_id);

	let rd_hex = await signP2SH({
		is_first_sign: false,
		txhex: rd.hex,
		pubkey_1: rd.pub_key_a,
		pubkey_2: rd.pub_key_b,
		privkey: privKeyResponse.value,
		inputs: inputs,
	});
	//let rd_hex  = await signP2SH(false, rd.hex, rd.pub_key_a, rd.pub_key_b, tempKey, inputs);

	// will send 100364
	let signedInfo: SignedInfo100364 = {
		channel_id: e.result.channel_id,
		c2b_rd_signed_hex: rd_hex,
	};
	const sendSignedHex100364Res = await obdapi.sendSignedHex100364(signedInfo);
	if (sendSignedHex100364Res.isErr()) {
		return err(sendSignedHex100364Res.error.message);
	}
	await clearOmniboltCheckpoint({
		channelId: e.result.channel_id,
	});
	return ok(sendSignedHex100364Res.value);
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
		const signingDataResponse = getSigningData({ channelId });
		if (signingDataResponse.isErr()) {
			return err(signingDataResponse.error.message);
		}
		const signingData = signingDataResponse.value;

		//TODO: Save the recipient_node_peer_id separately when opening channels in the event the counterparty does not share the same server.
		const { nodePeerId: recipient_node_peer_id } = userData.value;

		const channelPeerId = getChannelPeerId({ channelId });
		if (channelPeerId.isErr()) {
			return err(channelPeerId.error.message);
		}
		const recipient_user_peer_id = channelPeerId.value;

		const addressIndexResponse = await getNextOmniboltAddress({});
		if (addressIndexResponse.isErr()) {
			return err(addressIndexResponse.error.message);
		}
		const newAddressIndex = addressIndexResponse.value;
		const newAddressIndexPrivKey = await getPrivateKey({
			addressData: newAddressIndex,
		});
		if (newAddressIndexPrivKey.isErr()) {
			return err(newAddressIndexPrivKey.error.message);
		}
		let newTempPrivKey = newAddressIndexPrivKey.value || '';
		let lastTempPrivKey = signingData?.kTempPrivKey || '';

		const info: CommitmentTx = {
			channel_id: channelId,
			amount,
			curr_temp_address_pub_key: newAddressIndex.publicKey,
			last_temp_address_private_key: lastTempPrivKey,
			curr_temp_address_index: newAddressIndex.index,
		};

		const response = await obdapi.commitmentTransactionCreated(
			recipient_node_peer_id,
			recipient_user_peer_id,
			info,
		);

		if (response.isErr()) {
			return err(response.error.message);
		}
		const e = response.value;

		// Sender sign the tx on client side
		// NO.1 counterparty_raw_data
		let cr = e.counterparty_raw_data;
		let inputs = cr.inputs;

		console.info('START = ' + new Date().getTime());
		const fundingData = await getFundingAddress({ channelId: e.channel_id });
		if (fundingData.isErr()) {
			return err(fundingData.error.message);
		}
		let privkey = fundingData.value.privateKey;
		console.info('END READ DB = ' + new Date().getTime());

		let cr_hex = await signP2SH({
			is_first_sign: true,
			txhex: cr.hex,
			pubkey_1: cr.pub_key_a,
			pubkey_2: cr.pub_key_b,
			privkey,
			inputs,
		});

		console.info('END SIGN = ' + new Date().getTime());

		// NO.2 rsmc_raw_data
		let rr = e.rsmc_raw_data;
		inputs = rr.inputs;
		let rr_hex = await signP2SH({
			is_first_sign: true,
			txhex: rr.hex,
			pubkey_1: rr.pub_key_a,
			pubkey_2: rr.pub_key_b,
			privkey,
			inputs,
		});

		// will send 100360
		let signedInfo: SignedInfo100360 = {
			channel_id: e.channel_id,
			counterparty_signed_hex: cr_hex,
			rsmc_signed_hex: rr_hex,
		};

		const sendSignedHex100360Response = await sendSignedHex100360(
			recipient_node_peer_id,
			recipient_user_peer_id,
			signedInfo,
		);

		if (sendSignedHex100360Response.isErr()) {
			return err(sendSignedHex100360Response.error.message);
		}

		await Promise.all([
			updateSigningData({
				channelId,
				signingDataKey: 'addressIndex',
				signingData: newAddressIndex,
			}),
			updateSigningData({
				channelId,
				signingDataKey: 'kTempPrivKey',
				signingData: newTempPrivKey,
			}),
			addOmniboltAddress({}),
		]);
		return ok('');
	} catch (e) {
		return err(e);
	}
};

/**
 * Type -100360 Protocol send signed info that Sender signed in 100351 to OBD.
 *
 * @param nodeID peer id of the obd node where the fundee logged in.
 * @param userID the user id of the fundee.
 * @param signedInfo
 */
export const sendSignedHex100360 = async (
	nodeID: string,
	userID: string,
	signedInfo,
): Promise<any> => {
	return await obdapi.sendSignedHex100360(nodeID, userID, signedInfo);
};

/**
 * listening to -110352
 * @param {TOn110352} data
 */
export const on110352 = async (
	data: TOn110352,
): Promise<Result<ISendSignedHex100363Response>> => {
	const e = data.result;

	const signingDataResponse = getSigningData({ channelId: e.channel_id });
	if (signingDataResponse.isErr()) {
		return err(signingDataResponse.error.message);
	}
	const signingData = signingDataResponse.value;

	let nodeID = e.payee_node_address;
	let userID = e.payee_peer_id;

	// Receiver sign the tx on client side
	// NO.1
	let rd = e.c2a_rd_partial_data;
	const rd_inputs = rd.inputs;
	const tempPrivKey = await getPrivateKey({
		addressData: signingData.addressIndex,
	});
	if (tempPrivKey.isErr()) {
		return err(tempPrivKey.error.message);
	}
	let tempKey = tempPrivKey.value;
	let rd_hex = await signP2SH({
		is_first_sign: false,
		txhex: rd.hex,
		pubkey_1: rd.pub_key_a,
		pubkey_2: rd.pub_key_b,
		privkey: tempKey,
		inputs: rd_inputs,
	});

	// NO.2
	const fundingData = await getFundingAddress({ channelId: e.channel_id });
	if (fundingData.isErr()) {
		return err(fundingData.error.message);
	}
	let privkey = fundingData.value.privateKey;
	let cp = e.c2b_counterparty_partial_data;
	const cp_inputs = cp.inputs;
	let cp_hex = await signP2SH({
		is_first_sign: false,
		txhex: cp.hex,
		pubkey_1: cp.pub_key_a,
		pubkey_2: cp.pub_key_b,
		privkey,
		inputs: cp_inputs,
	});

	// NO.3
	let rp = e.c2b_rsmc_partial_data;
	const rp_inputs = rp.inputs;
	let rp_hex = await signP2SH({
		is_first_sign: false,
		txhex: rp.hex,
		pubkey_1: rp.pub_key_a,
		pubkey_2: rp.pub_key_b,
		privkey,
		inputs: rp_inputs,
	});

	// will send 100362
	const signedInfo100362: SignedInfo100362 = {
		channel_id: e.channel_id,
		c2b_rsmc_signed_hex: rp_hex,
		c2b_counterparty_signed_hex: cp_hex,
		c2a_rd_signed_hex: rd_hex,
	};

	let resp = await obdapi.sendSignedHex100362(nodeID, userID, signedInfo100362);
	if (resp.isErr()) {
		return err(resp.error.message);
	}
	// console.info('sendSignedHex100362 = ' + JSON.stringify(e));

	// Receiver sign the tx on client side
	// NO.1 c2b_br_raw_data
	let br = resp.value.c2b_br_raw_data;
	let br_inputs = br.inputs;
	let br_hex = await signP2SH({
		is_first_sign: true,
		txhex: br.hex,
		pubkey_1: br.pub_key_a,
		pubkey_2: br.pub_key_b,
		privkey,
		inputs: br_inputs,
	});

	// NO.2 c2b_rd_raw_data
	let rd2 = resp.value.c2b_rd_raw_data;
	const rd_inputs2 = rd.inputs;
	let rd_hex2 = await signP2SH({
		is_first_sign: true,
		txhex: rd2.hex,
		pubkey_1: rd2.pub_key_a,
		pubkey_2: rd2.pub_key_b,
		privkey,
		inputs: rd_inputs2,
	});

	// will send 100363
	let signedInfo100363: SignedInfo100363 = {
		channel_id: e.channel_id,
		c2b_rd_signed_hex: rd_hex2,
		c2b_br_signed_hex: br_hex,
		c2b_br_id: br.br_id,
	};

	const sendSignedHex100363Res = await obdapi.sendSignedHex100363(
		nodeID,
		userID,
		signedInfo100363,
	);
	if (sendSignedHex100363Res.isErr()) {
		return err(sendSignedHex100363Res.error.message);
	}
	return ok(sendSignedHex100363Res.value);
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
export const onChannelOpenAttempt = async (
	data: TOnChannelOpenAttempt,
): Promise<Result<TOnChannelOpenAttempt>> => {
	const { funder_node_address, funder_peer_id, temporary_channel_id } =
		data.result;
	const selectedWallet = getSelectedWallet();
	const selectedNetwork = getSelectedNetwork();
	const channelAddress =
		getStore().omnibolt.wallets[selectedWallet].addressIndex[selectedNetwork];
	const funding_pubkey = channelAddress.publicKey;

	const info = {
		temporary_channel_id,
		funding_pubkey,
		approval: true,
		fundee_address_index: channelAddress.index,
	};

	const response = await obdapi.acceptChannel(
		funder_node_address,
		funder_peer_id,
		info,
	);
	if (response.isErr()) {
		return err(response.error.message);
	}
	await Promise.all([
		addOmniboltAddress({ selectedWallet, selectedNetwork }),
		updateSigningData({
			selectedWallet,
			selectedNetwork,
			channelId: temporary_channel_id,
			signingDataKey: 'fundingAddress',
			signingData: channelAddress,
		}),
		updateSigningData({
			selectedWallet,
			selectedNetwork,
			channelId: temporary_channel_id,
			signingDataKey: 'addressIndex',
			signingData: channelAddress,
		}),
		clearOmniboltCheckpoint({
			channelId: temporary_channel_id,
			selectedWallet,
			selectedNetwork,
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
export const onAcceptChannel = (data: TOnAcceptChannel): void => {
	console.log('onAcceptChannel', data);
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
