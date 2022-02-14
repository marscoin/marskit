/**
 * Test functions for lightning development to be used until UX is finalized.
 */

import lnd, {
	ENetworks as LndNetworks,
	lnrpc,
	ss_lnrpc,
	TLndConf,
} from '@synonymdev/react-native-lightning';
import { Platform } from 'react-native';
import Clipboard from '@react-native-community/clipboard';
import RNFS from 'react-native-fs';
import { ILightning } from '../../store/types/lightning';
import { getStore } from '../../store/helpers';
import { err, ok, Result } from '../result';
import { getKeychainValue, setKeychainValue, sleep } from '../helpers';
import { CipherSeed } from 'aezeed';

const packageJson = require('../../../package.json');

export const defaultNodePubKey =
	'034ecfd567a64f06742ac300a2985676abc0b1dc6345904a08bb52d5418e685f79'; //Our testnet server
const defaultNodeHost = '35.240.72.95:9735'; //Our testnet server

// const defaultNodePubKey =
// 	'024684a0ed0cf7075b9e56d7825e44eb30ac7de7b93dea1b72dab05d23b90c8dbd'; //Local regtest node
// const defaultNodeHost = '127.0.0.1:9737'; //Local regtest node

export const getCustomLndConf = (network: LndNetworks): TLndConf => {
	//Lightning alias to help identify users on our node
	let alias = `Backpack v${packageJson.version}`;
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

export const openChannelStream = (
	sats: number,
	onUpdate: (state: Result<lnrpc.OpenStatusUpdate>) => void,
	onDone: () => void,
): Uint8Array => {
	const { selectedNetwork, selectedWallet } = getStore().wallet;
	const closeAddress =
		getStore().wallet?.wallets[selectedWallet]?.addressIndex[selectedNetwork]
			.address;

	const channelId = lnd.openChannelStream(
		sats,
		defaultNodePubKey,
		closeAddress,
		(res) => {
			if (res.isErr()) {
				return onUpdate(err(res.error));
			}

			onUpdate(ok(res.value));
		},
		() => {
			onDone();
		},
	);

	return channelId;
};

/**
 * Wipes the testnet directory for LND
 * @returns {Promise<Ok<string>>}
 */
export const wipeLndDir = async (): Promise<Result<string>> => {
	const stateRes = await lnd.stateService.getState();

	if (stateRes.isOk() && stateRes.value === ss_lnrpc.WalletState.RPC_ACTIVE) {
		await lnd.stop();

		//Takes a few seconds to stop the daemon
		await sleep(5000);
	}

	const existingLndDir = `${RNFS.DocumentDirectoryPath}/lnd`;

	try {
		await RNFS.unlink(existingLndDir);
	} catch (e) {
		return err(e);
	}

	return ok('LND directory wiped');
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
	const { task, unzipProgress, downloadProgress } =
		lightning.cachedNeutrinoDBDownloadState;
	if (task === 'downloading') {
		return `Cache ⬇ ${downloadProgress}%`;
	}

	if (task === 'unzipping') {
		return `Unzipping cache 🤐 ${unzipProgress}%`;
	}

	if (lightning.state !== ss_lnrpc.WalletState.RPC_ACTIVE) {
		return lnd.stateService.readableState(lightning.state);
	}

	if (!lightning.info.syncedToChain) {
		return `Syncing ⌛ (${lightning.info.blockHeight})`;
	}

	return '';
};

/**
 * Attempt to retrieve an existing lightning seed. Creates a new one otherwise.
 * @return {Promise<Result<string[]>>}
 */
export const getLightningSeed = async (): Promise<Result<string[]>> => {
	try {
		let lndSeed: string[] = [];
		// Check if seed already exists.
		let seedStr = (await getKeychainValue({ key: 'lndMnemonic' })).data; //Set if wallet is being restored from a backup
		// Set and return existing seed.
		if (seedStr) {
			lndSeed = seedStr.split(' ');
		} else {
			// Create a new lightning seed.
			const seedRes: string[] = await CipherSeed.random()
				.toMnemonic()
				.split(' ');
			if (!seedRes) {
				return err(seedRes);
			}
			lndSeed = seedRes;
		}
		return ok(lndSeed);
	} catch (e) {
		return err(e);
	}
};

/**
 * Saves the provided lightning seed to keychain storage.
 * Returns the current (if set) or new lightning seed if none was provided.
 * @param {string[]} [lndSeed]
 * @return {string[]}
 */
export const setupLightningSeed = async (
	lndSeed?: string[],
): Promise<Result<string[]>> => {
	if (!lndSeed) {
		const lndSeedRes = await getLightningSeed();
		if (lndSeedRes.isErr()) {
			return err(lndSeedRes.error.message);
		}
		lndSeed = lndSeedRes.value;
	}
	await setKeychainValue({
		key: 'lndMnemonic',
		value: lndSeed.join(' '),
	});
	return ok(lndSeed);
};
