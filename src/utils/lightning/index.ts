/**
 * Test functions for lightning development to be used until UX is finalized.
 */

import lnd from 'react-native-lightning';
import LndConf from 'react-native-lightning/dist/lnd.conf';
import {
	ENetworks as LndNetworks,
	TCurrentLndState,
} from 'react-native-lightning/dist/types';
import { Alert } from 'react-native';
import Clipboard from '@react-native-community/clipboard';
import { ILightning } from '../../store/types/lightning';
import { updateLightning } from '../../store/actions/lightning';
import { getDispatch } from '../../store/helpers';
import { lnrpc } from 'react-native-lightning/dist/rpc';

const tempPassword = 'shhhhhhhh123';
const testnetNodePubkey =
	'0324b835e1484d6637594edc2b97f3f85490afb782dd308b241485216ad47598df';
const testnetNodeHost = '174.138.2.184:9735';

const regtestPolarConf = {
	Bitcoind: {
		'bitcoind.rpchost': '10.0.0.100',
		'bitcoind.rpcuser': 'polaruser',
		'bitcoind.rpcpass': 'polarpass',
		'bitcoind.zmqpubrawblock': 'tcp://10.0.0.100:28334',
		'bitcoind.zmqpubrawtx': 'tcp://10.0.0.100:29335',
	},
};

const testNetconf = {
	Neutrino: {
		'neutrino.connect': '174.138.2.184:18333',
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

let previousInfoResponseString = '';
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

	lnd
		.getInfo()
		.then((res) => {
			if (res.isOk()) {
				if (previousInfoResponseString !== JSON.stringify(res.value)) {
					getDispatch()(updateLightning({ info: res.value }));
				}

				previousInfoResponseString = JSON.stringify(res.value);
			}
		})
		.finally(() => {
			pollLndGetInfoTimeout = setTimeout(pollLndGetInfo, 3000);
		});
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

export const getBalance = async (onComplete: (msg: string) => void) => {
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

export const copyNewAddressToClipboard = async (): Promise<string> => {
	const res = await lnd.getAddress();
	if (res.isErr()) {
		return '';
	}

	Clipboard.setString(res.value.address);
	return res.value.address;
};

export const connectToPeer = async (onComplete: (msg: string) => void) => {
	onComplete('Connecting');

	const connectRes = await lnd.connectPeer(testnetNodePubkey, testnetNodeHost);
	if (connectRes.isErr()) {
		onDebugError(connectRes.error, onComplete);
		return;
	}

	onComplete('Connected to node...');
};

export const openMaxChannel = async (onComplete: (msg: string) => void) => {
	Alert.prompt('Sats', '', [
		{
			text: 'Cancel',
			onPress: () => console.log('Cancel Pressed'),
			style: 'cancel',
		},
		{
			text: 'Open',
			onPress: async (sats) => {
				const value = Number(sats);
				if (!value) {
					onDebugError(new Error('Invalid sats amount'), onComplete);
					return;
				}

				const openRes = await lnd.openChannel(value, testnetNodePubkey);
				if (openRes.isErr()) {
					onDebugError(openRes.error, onComplete);
					return;
				}

				onDebugSuccess('Channel opening. Wait for confirmation.', onComplete);
			},
		},
	]);
};

export const payInvoice = async (onComplete: (msg: string) => void) => {
	const confirmPay = (invoice: string, message: string): void => {
		Alert.alert('Pay Invoice', message, [
			{
				text: 'Cancel',
				onPress: () => console.log('Cancel Pressed'),
				style: 'cancel',
			},
			{
				text: 'Confirm',
				onPress: async () => {
					const res = await lnd.payInvoice(invoice ?? '');
					if (res.isErr()) {
						onDebugError(res.error, onComplete);
						return;
					}

					onDebugSuccess('Paid!', onComplete);
				},
			},
		]);
	};

	Alert.prompt('Invoice', 'ln...', [
		{
			text: 'Cancel',
			onPress: () => console.log('Cancel Pressed'),
			style: 'cancel',
		},
		{
			text: 'Decode',
			onPress: async (invoice = '') => {
				const res = await lnd.decodeInvoice(invoice);
				if (res.isErr()) {
					onDebugError(res.error, onComplete);
					return;
				}

				const { numSatoshis, description } = res.value;
				confirmPay(invoice, `Pay ${numSatoshis} sats for '${description}'`);
			},
		},
	]);
};

export const lightningStatusMessage = (lightning: ILightning): string => {
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

	return 'Ready ✅';
};
