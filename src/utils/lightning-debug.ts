/**
 * Test functions for lightning development to be used until UX is finalized.
 */

import lnd from "react-native-lightning";
import LndConf from "react-native-lightning/dist/lnd.conf";
import { ENetworks as LndNetworks } from "react-native-lightning/dist/types";
import { Alert } from "react-native";
import Clipboard from "@react-native-community/clipboard";

const tempPassword = "shhhhhhhh123";

/**
 * Start LND and unlock a wallet if one exists
 * @returns {Promise<void>}
 */
export const startLnd = async () => {
	//TODO use /utils/networks.ts to determine the network

	const regtestPolarConf = {
		Bitcoind: {
			'bitcoind.rpchost': '10.0.0.100',
			'bitcoind.rpcuser': 'polaruser',
			'bitcoind.rpcpass': 'polarpass',
			'bitcoind.zmqpubrawblock': 'tcp://10.0.0.100:28334',
			'bitcoind.zmqpubrawtx': 'tcp://10.0.0.100:29335'
		}
	};

	const lndConf = new LndConf(LndNetworks.testnet);

	const res = await lnd.start(lndConf);
	if (res.isErr()) {
		Alert.alert("LND failed to start", res.error.message);
		return;
	}

	const stateRes = await lnd.currentState();
	if (stateRes.isErr()) {
		Alert.alert("LND failed to get current state", stateRes.error.message);
		return;
	}

	if (stateRes.value.grpcReady) {
		return;
	}

	const existsRes = await lnd.walletExists(lndConf.network);
	if (existsRes.isErr()) {
		Alert.alert("LND failed to check if wallet exists", stateRes.error.message);
		return;
	}

	if (existsRes.value === true) {
		await unlockWallet();
	} else {
		await createWallet();
	}
}

const onDebugError = (e: Error, setMessage) => setMessage(`❌ ${e.message}`);
const onDebugSuccess = (msg: string, setMessage) => setMessage(`✅ ${msg}`);

const createWallet = async () => {
	const res = await lnd.genSeed();
	if (res.isErr()) {
		Alert.alert("Generate seed error", res.error.message);
		return;
	}

	const seed = res.value;

	const createRes = await lnd.createWallet(tempPassword, seed);
	if (createRes.isErr()) {
		Alert.alert("Create wallet error", createRes.error.message);
		return;
	}


	console.log(`Wallet created`);
}

const unlockWallet = async () => {
	const res = await lnd.unlockWallet(tempPassword);
	if (res.isErr()) {
		Alert.alert("Unlock wallet error", res.error.message);
		return;
	}

	console.log(`Wallet unlocked.`);
}

export const getInfo = async (onComplete: (msg: string) => void) => {
	const res = await lnd.getInfo();
	if (res.isErr()) {
		onDebugError(res.error, onComplete);
		return;
	}

	const { blockHeight, chains, identityPubkey, numActiveChannels, numInactiveChannels, numPeers, syncedToChain, version } = res.value;
	let output = `Version: ${version}`
	output += `\n\nSynced: ${syncedToChain ? '✅' : '❌'}`;
	output += `\n\nBlock Height: ${blockHeight}`;
	output += `\n\nIdentity Pubkey: ${identityPubkey}`;
	output += `\n\nActive Channels: ${numActiveChannels}`;
	output += `\n\nInactive Channels: ${numInactiveChannels}`;
	output += `\n\nPeers: ${numPeers}`;
	output += `\n\nNetwork: ${chains[0].network}`;

	onDebugSuccess(output, onComplete);
}

export const getBalance = async (onComplete: (msg: string) => void) => {
	const walletRes = await lnd.getWalletBalance();
	if (walletRes.isErr()) {
		onDebugError(walletRes.error, onComplete);
		return;
	}

	let output = '';
	Object.keys(walletRes.value).forEach(key => {
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

	Object.keys(channelRes.value).forEach(key => {
		const value = channelRes.value[key];
		if (value != null && typeof value != "object") {
			output += `\n\nChannel ${key}: ${value}`;
		}
	});

	if (output === '') {
		output = 'No balances found. Add funds on chain first.';
	}

	onDebugSuccess(output, onComplete);
}

export const copyNewAddressToClipboard = async (onComplete: (msg: string) => void) => {
	const res = await lnd.getAddress()
	if (res.isErr()) {
		onDebugError(res.error, onComplete);
		return;
	}

	Clipboard.setString(res.value.address);
	onDebugSuccess(`Copied to clipboard:\n${res.value.address}`, onComplete);
}

export const openMaxChannel = async (onComplete: (msg: string) => void) => {
	Alert.prompt(
		"Node details",
		"<pubKey>@<address>:<port>",
		[
			{
				text: "Cancel",
				onPress: () => console.log("Cancel Pressed"),
				style: "cancel"
			},
			{
				text: "Open",
				onPress: async(nodeDetails) => {
					onComplete("Connecting...");

					const split = nodeDetails?.split("@");
					if (!split) {
						onDebugError(new Error("Enter node details"), onComplete);
						return;
					}

					const connectRes = await lnd.connectPeer(split[0], split[1]);
					if (connectRes.isErr() && connectRes.error.message.indexOf("already connected to peer") < 0) {
						onDebugError(connectRes.error, onComplete);
						return;
					}

					onComplete("Connected to node...")

					const balanceRes = await lnd.getWalletBalance();
					if (balanceRes.isErr()) {
						onDebugError(balanceRes.error, onComplete);
						return;
					}

					let value = balanceRes.value.confirmedBalance * 0.8;
					const max = 16000000;
					if (value > max) {
						value = max;
					}

					const openRes = await lnd.openChannel(Number(value), split[0]);
					if (openRes.isErr()) {
						onDebugError(openRes.error, onComplete);
						return;
					}

					onDebugSuccess("Channel opening...", onComplete);
				}
			}
		]
	);
}

export const payInvoice = async (onComplete: (msg: string) => void) => {
	const confirmPay = (invoice: string, message: string): void => {
		Alert.alert(
			"Pay Invoice",
			message,
			[
				{
					text: "Cancel",
					onPress: () => console.log("Cancel Pressed"),
					style: "cancel"
				},
				{
					text: "Confirm",
					onPress: async() => {
						const res = await lnd.payInvoice(invoice ?? "")
						if (res.isErr()) {
							onDebugError(res.error, onComplete);
							return;
						}

						onDebugSuccess("Paid!", onComplete);
					}
				}
			]
		);
	}

	Alert.prompt(
		"Invoice",
		"ln...",
		[
			{
				text: "Cancel",
				onPress: () => console.log("Cancel Pressed"),
				style: "cancel"
			},
			{
				text: "Decode",
				onPress: async(invoice = "") => {
					const res = await lnd.decodeInvoice(invoice)
					if (res.isErr()) {
						onDebugError(res.error, onComplete);
						return;
					}

					const { numSatoshis, description } = res.value;
					confirmPay(invoice, `Pay ${numSatoshis} sats for '${description}'`);
				}
			}
		]
	);
}
