/**
 * Test functions for lightning development to be used until UX is finalized.
 */

import lnd from 'react-native-lightning';
import {
	ENetworks as LndNetworks,
	TLndConf,
} from 'react-native-lightning/dist/types';
import { Platform } from 'react-native';
import Clipboard from '@react-native-community/clipboard';
import { ILightning } from '../../store/types/lightning';
import { getStore } from '../../store/helpers';
import { err, ok, Result } from '../result';
import { lnrpc } from 'react-native-lightning/dist/rpc';

const packageJson = require('../../../package.json');

const defaultNodePubKey =
	'034ecfd567a64f06742ac300a2985676abc0b1dc6345904a08bb52d5418e685f79'; //Our testnet server
const defaultNodeHost = '35.240.72.95:9735'; //Our testnet server

// const defaultNodePubKey =
// 	'024684a0ed0cf7075b9e56d7825e44eb30ac7de7b93dea1b72dab05d23b90c8dbd'; //Local regtest node
// const defaultNodeHost = '127.0.0.1:9737'; //Local regtest node

export const getCustomLndConf = (network: LndNetworks): TLndConf => {
	//Lightning alias to help identify users on our node
	let alias = `Spectrum v${packageJson.version}`;
	if (__DEV__) {
		alias = `${alias} (${Platform.OS} ${Platform.Version})`;
	}

	switch (network) {
		case LndNetworks.regtest: {
			return {
				'Application Options': {
					alias,
				},
				Bitcoind: {
					'bitcoind.rpchost': '10.0.0.100',
					'bitcoind.rpcuser': 'polaruser',
					'bitcoind.rpcpass': 'polarpass',
					'bitcoind.zmqpubrawblock': 'tcp://10.0.0.100:28334',
					'bitcoind.zmqpubrawtx': 'tcp://10.0.0.100:29335',
				},
			};
		}
		case LndNetworks.testnet: {
			return {
				'Application Options': {
					alias,
				},
				Neutrino: {
					'neutrino.connect': '35.240.72.95:18333',
				},
			};
		}
		case LndNetworks.mainnet: {
			return {};
		}
	}
};

export const copyNewAddressToClipboard = async (): Promise<string> => {
	const res = await lnd.getAddress();
	if (res.isErr()) {
		return '';
	}

	Clipboard.setString(res.value.address);
	return res.value.address;
};

export const connectToDefaultPeer = async (): Promise<
	Result<lnrpc.ConnectPeerResponse>
> => {
	const res = await lnd.connectPeer(defaultNodePubKey, defaultNodeHost);

	if (res.isOk()) {
		return ok(res.value);
	}

	return err(res.error);
};

export const openMaxChannel = async (): Promise<Result<lnrpc.ChannelPoint>> => {
	let value = getStore().lightning.onChainBalance.confirmedBalance;

	const maxChannel = 0.16 * 100000000;
	if (value > maxChannel) {
		value = maxChannel;
	}

	//TODO use actual fee estimate
	value = Number(value) - 50000;
	// const feeEstimateRes = lnd.feeEstimate()

	const res = await lnd.openChannel(value, defaultNodePubKey);

	if (res.isOk()) {
		return ok(res.value);
	}

	return err(res.error);
};

//Debug functions to help with development

const onDebugError = (e: Error, setMessage): void =>
	setMessage(`❌ ${e.message}`);
const onDebugSuccess = (msg: string, setMessage): void =>
	setMessage(`✅ ${msg}`);

/**
 * Debug use only
 * @param onComplete
 * @returns {Promise<void>}
 */
export const debugGetBalance = async (
	onComplete: (msg: string) => void,
): Promise<void> => {
	const walletRes = await lnd.getWalletBalance();
	if (walletRes.isErr()) {
		onDebugError(walletRes.error, onComplete);
		return;
	}

	let output = '';
	Object.keys(walletRes.value).forEach((key) => {
		const value = walletRes.value[key];
		if (value != null) {
			output += `\n\nOn chain ${key}: ${value}`;
		}
	});

	const channelRes = await lnd.getChannelBalance();
	if (channelRes.isErr()) {
		onDebugError(channelRes.error, onComplete);
		return;
	}

	Object.keys(channelRes.value).forEach((key) => {
		const value = channelRes.value[key];
		if (value != null && typeof value !== 'object') {
			output += `\n\nChannel ${key}: ${value}`;
		}
	});

	if (output === '') {
		output = 'No balances found. Add funds on chain first.';
	}

	onDebugSuccess(output, onComplete);
};

/**
 * Debug use only
 * @param onComplete
 * @returns {Promise<void>}
 */
export const debugListPeers = async (
	onComplete: (msg: string) => void,
): Promise<void> => {
	const res = await lnd.listPeers();
	if (res.isErr()) {
		onDebugError(res.error, onComplete);
		return;
	}

	let output = '';
	res.value.peers.forEach((peer) => {
		output += `\n${
			peer.pubKey === defaultNodePubKey ? '*Default node - ' : ''
		}${peer.address}\n${peer.pubKey?.substring(0, 20)}...\n`;
	});

	onDebugSuccess(output, onComplete);
};

/**
 * Debug use only
 * @param lightning
 * @returns {string}
 */
export const debugLightningStatusMessage = (lightning: ILightning): string => {
	if (!lightning.state.lndRunning) {
		return 'Starting ⌛';
	}

	if (!lightning.state.walletUnlocked) {
		return 'Unlocking ⌛';
	}

	if (!lightning.state.grpcReady) {
		return 'Unlocked ⌛';
	}

	if (!lightning.info.syncedToChain) {
		return `Syncing ⌛ (${lightning.info.blockHeight})`;
	}

	return `Ready ✅${__DEV__ ? ` (${lightning.info.blockHeight})` : ''}`;
};
