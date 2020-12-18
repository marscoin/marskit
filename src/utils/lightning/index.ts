/**
 * Test functions for lightning development to be used until UX is finalized.
 */

import lnd from 'react-native-lightning';
import LndConf from 'react-native-lightning/dist/lnd.conf';
import {
	ENetworks as LndNetworks,
	TCurrentLndState,
} from 'react-native-lightning/dist/types';
import { Alert, Platform } from 'react-native';
import Clipboard from '@react-native-community/clipboard';
import { ILightning } from '../../store/types/lightning';
import { updateLightning } from '../../store/actions/lightning';
import { getDispatch, getStore } from '../../store/helpers';
import { lnrpc } from 'react-native-lightning/dist/rpc';

const packageJson = require('../../../package.json');

const tempPassword = 'shhhhhhhh123';

const defaultNodePubKey =
	'034ecfd567a64f06742ac300a2985676abc0b1dc6345904a08bb52d5418e685f79'; //Our testnet server
const defaultNodeHost = '0.tcp.ngrok.io:17949'; //'35.240.72.95:9735'; //Our testnet server

// const defaultNodePubKey =
// 	'024684a0ed0cf7075b9e56d7825e44eb30ac7de7b93dea1b72dab05d23b90c8dbd'; //Local regtest node
// const defaultNodeHost = '127.0.0.1:9737'; //Local regtest node

const regtestPolarConf = {
	Bitcoind: {
		'bitcoind.rpchost': '10.0.0.100',
		'bitcoind.rpcuser': 'polaruser',
		'bitcoind.rpcpass': 'polarpass',
		'bitcoind.zmqpubrawblock': 'tcp://10.0.0.100:28334',
		'bitcoind.zmqpubrawtx': 'tcp://10.0.0.100:29335',
	},
};

//Lightning alias to help identify users on our node
let alias = `Spectrum v${packageJson.version}`;
if (__DEV__) {
	alias = `${alias} (${Platform.OS} ${Platform.Version})`;
}

const testNetconf = {
	'Application Options': {
		alias,
	},
	Neutrino: {
		'neutrino.connect': '35.240.72.95:18333',
	},
};

//TODO use /utils/networks.ts to determine the network

const lndConf = new LndConf(LndNetworks.testnet, testNetconf);

let pollLndGetInfoTimeout;

/**
 * Start LND and unlock a wallet if one exists
 * @returns {Promise<void>}
 */
export const startLnd = async () => {
	//Set initial LND state
	const stateRes = await lnd.currentState();
	if (stateRes.isOk()) {
		await updateLightningState(stateRes.value);
	}

	//Any future updates to LND state
	lnd.subscribeToCurrentState(updateLightningState);
	pollLndGetInfo().then();

	if (stateRes.isOk() && stateRes.value.grpcReady) {
		return; //LND already running and unlocked
	}

	const res = await lnd.start(lndConf);
	if (res.isErr()) {
		console.error('LND failed to start', res.error.message);
		return;
	}
};

/**
 * //TODO remove when not needed anymore
 * Temp function until on boarding has been developed
 */
export const createOrUnlockLndWallet = async () => {
	const stateRes = await lnd.currentState();
	if (stateRes.isOk() && stateRes.value.grpcReady) {
		return; //Wallet already unlocked
	}

	const existsRes = await lnd.walletExists(lndConf.network);
	if (existsRes.isErr()) {
		console.error(
			'LND failed to check if wallet exists',
			existsRes.error.message,
		);
		return;
	}

	if (existsRes.value === true) {
		await unlockWallet();
	} else {
		await createWallet();
	}
};

//TODO try subscribe to all this instead of polling
let previousLndPayloadString = '';
const pollLndGetInfo = async (): Promise<void> => {
	clearTimeout(pollLndGetInfoTimeout); //If previously subscribed make sure we don't keep have more than 1

	//If grpc hasn't even started yet rather assume lnd is not synced
	const stateRes = await lnd.currentState();
	if (stateRes.isOk() && !stateRes.value.grpcReady) {
		getDispatch()(
			updateLightning({
				info: lnrpc.GetInfoResponse.create({ syncedToChain: false }),
			}),
		);
		pollLndGetInfoTimeout = setTimeout(pollLndGetInfo, 3000);
		return;
	}

	let payload = {};
	const infoRes = await lnd.getInfo();
	if (infoRes.isOk()) {
		payload = { info: infoRes.value };
	}

	const walletBalanceRes = await lnd.getWalletBalance();
	if (walletBalanceRes.isOk()) {
		payload = { ...payload, onChainBalance: walletBalanceRes.value };
	}

	const channelBalanceRes = await lnd.getChannelBalance();
	if (channelBalanceRes.isOk()) {
		payload = { ...payload, channelBalance: channelBalanceRes.value };
	}

	//If nothing has changed don't spam the logs with updates
	if (previousLndPayloadString !== JSON.stringify(payload)) {
		getDispatch()(updateLightning(payload));
	}
	previousLndPayloadString = JSON.stringify(payload);

	pollLndGetInfoTimeout = setTimeout(pollLndGetInfo, 3000);
};

export const updateLightningState = async (state?: TCurrentLndState) => {
	//If the state to set is not passed in then get it
	if (!state) {
		const stateRes = await lnd.currentState();
		if (stateRes.isOk()) {
			state = stateRes.value;
		}
	}

	if (state) {
		getDispatch()(updateLightning({ state }));
	}
};

const onDebugError = (e: Error, setMessage) => setMessage(`❌ ${e.message}`);
const onDebugSuccess = (msg: string, setMessage) => setMessage(`✅ ${msg}`);

const createWallet = async () => {
	const res = await lnd.genSeed();
	if (res.isErr()) {
		Alert.alert('Generate seed error', res.error.message);
		return;
	}

	const seed = res.value;

	const createRes = await lnd.createWallet(tempPassword, seed);
	if (createRes.isErr()) {
		Alert.alert('Create wallet error', createRes.error.message);
		return;
	}

	console.log('Wallet created');
};

const unlockWallet = async () => {
	const res = await lnd.unlockWallet(tempPassword);
	if (res.isErr()) {
		Alert.alert('Unlock wallet error', res.error.message);
		return;
	}

	console.log('Wallet unlocked.');
};

export const copyNewAddressToClipboard = async (): Promise<string> => {
	const res = await lnd.getAddress();
	if (res.isErr()) {
		return '';
	}

	Clipboard.setString(res.value.address);
	return res.value.address;
};

export const connectToDefaultPeer = async () => {
	return await lnd.connectPeer(defaultNodePubKey, defaultNodeHost);
};

export const openMaxChannel = async () => {
	let value = getStore().lightning.onChainBalance.confirmedBalance;

	const maxChannel = 0.16 * 100000000;
	if (value > maxChannel) {
		value = maxChannel;
	}

	//TODO use actual fee estimate
	value = Number(value) - 50000;
	// const feeEstimateRes = lnd.feeEstimate()

	return await lnd.openChannel(value, defaultNodePubKey);
};

//Debug functions to help with development

export const debugGetBalance = async (onComplete: (msg: string) => void) => {
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

export const debugListPeers = async (onComplete: (msg: string) => void) => {
	const res = await lnd.listPeers();
	if (res.isErr()) {
		onDebugError(res.error, onComplete);
		return;
	}

	let output = '';
	res.value.peers.forEach((peer) => {
		output += `\n${peer.pubKey == defaultNodePubKey ? '*Default node - ' : ''}${
			peer.address
		}\n${peer.pubKey?.substring(0, 20)}...\n`;
	});

	onDebugSuccess(output, onComplete);
};

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
		return `Syncing ⌛ ${lightning.info.blockHeight}`;
	}

	return `Ready ✅${__DEV__ ? ` (${lightning.info.blockHeight})` : ''}`;
};
