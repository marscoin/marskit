import actions from './actions';
import { getDispatch } from '../helpers';
import lnd, {
	lnrpc,
	LndConf,
	ENetworks as LndNetworks,
	ICachedNeutrinoDBDownloadState,
	ss_lnrpc,
} from '@synonymdev/react-native-lightning';
import { connectToDefaultPeer, getCustomLndConf } from '../../utils/lightning';
import { err, ok, Result } from '../../utils/result';
import {
	showErrorNotification,
	showSuccessNotification,
} from '../../utils/notifications';
import { updateLightingActivityList } from './activity';
import { getKeychainValue, setKeychainValue } from '../../utils/helpers';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { performFullBackup } from './backup';
import { LNURLChannelParams } from 'js-lnurl';
import { getLNURLParams, lnurlChannel } from '@synonymdev/react-native-lnurl';

const dispatch = getDispatch();

const password = 'shhhhhhhh123'; //TODO use keychain stored password

let onRpcReady: (() => Promise<void>) | undefined;
/**
 * Starts the LND service
 * @param network
 * @returns {Promise<unknown>}
 */
export const startLnd = (
	network: LndNetworks,
	onLndReady: () => Promise<void>,
): Promise<Result<string>> => {
	onRpcReady = onLndReady;
	return new Promise(async (resolve) => {
		const stateRes = await lnd.stateService.getState();
		if (
			stateRes.isOk() &&
			stateRes.value === ss_lnrpc.WalletState.WAITING_TO_START
		) {
			const lndConf = new LndConf(network, getCustomLndConf(network));
			const res = await lnd.start(lndConf);
			if (res.isErr()) {
				return resolve(err(res.error));
			}
			await new Promise((r) => setTimeout(r, 2000));
		}

		lnd.stateService.subscribeToStateChanges(
			(updatedStateRes) => {
				if (updatedStateRes.isOk()) {
					onLightningStateUpdate(updatedStateRes.value);
				} else {
					showErrorNotification({
						title: 'Lightning state error',
						message: updatedStateRes.error.message,
					});
				}
			},
			() => {},
		);

		resolve(ok('LND started?'));
	});
};

const onLightningStateUpdate = async (
	state: ss_lnrpc.WalletState,
): Promise<void> => {
	await refreshLightningState(state);

	switch (state) {
		case ss_lnrpc.WalletState.NON_EXISTING: {
			await createLightningWallet();
			break;
		}
		case ss_lnrpc.WalletState.LOCKED: {
			await unlockLightningWallet();
			break;
		}
		case ss_lnrpc.WalletState.RPC_ACTIVE: {
			//Seems to require a slight delay between receiving this state and it actually being active
			// await new Promise((r) => setTimeout(r, 1000));

			//Wallet is ready to accept commands and subscriptions
			await refreshLightningTransactions();

			await subscribeToLndInfo();

			//Attempt to connect to default peer from the start so it's ready when the channel needs to be opened
			try {
				await connectToDefaultPeer();
			} catch {}

			//This is passed when LND is started for any additional logic that's requires after RPC is available
			if (onRpcReady) {
				await onRpcReady();
				onRpcReady = undefined;
			}

			break;
		}
	}
};

/**
 * Creates a new LND wallet
 * @param password
 * @param mnemonic
 * @param network
 * @returns {Promise<unknown>}
 */
export const createLightningWallet = (): Promise<Result<string>> => {
	return new Promise(async (resolve) => {
		let lndSeed: string[] = [];

		let seedStr = (await getKeychainValue({ key: 'lndMnemonic' })).data; //Set if wallet is being restored from a backup
		if (seedStr) {
			lndSeed = seedStr.split(' ');
		} else {
			const seedRes = await lnd.walletUnlocker.genSeed();
			if (seedRes.isErr()) {
				return resolve(err(seedRes.error));
			}

			lndSeed = seedRes.value;
		}

		//Generate Mnemonic if none was provided
		await setKeychainValue({ key: 'lndMnemonic', value: lndSeed.join(' ') });

		//If we have this in storage still it means we need to restore funds from a backed up channel
		const multiChanBackup = await AsyncStorage.getItem(
			'multiChanBackupRestore',
		);

		const createRes = await lnd.walletUnlocker.initWallet(
			password,
			lndSeed,
			multiChanBackup || undefined,
		);
		if (createRes.isErr()) {
			return resolve(err(createRes.error));
		}
		await dispatch({
			type: actions.CREATE_LIGHTNING_WALLET,
		});

		resolve(ok('LND wallet created'));
	});
};

/**
 * Unlocks an existing LND wallet if one exists
 * @param password
 * @param network
 * @returns {Promise<unknown>}
 */
export const unlockLightningWallet = async (): Promise<Result<string>> => {
	const unlockRes = await lnd.walletUnlocker.unlockWallet(password);
	if (unlockRes.isErr()) {
		return err(unlockRes.error);
	}

	await dispatch({
		type: actions.UNLOCK_LIGHTNING_WALLET,
	});

	return ok('Wallet unlocked');
};

/**
 * Updates the lightning store with the latest state of LND
 * @returns {(dispatch) => Promise<unknown>}
 */
export const refreshLightningState = (
	state?: ss_lnrpc.WalletState,
): Promise<Result<string>> => {
	return new Promise(async (resolve) => {
		if (!state) {
			const res = await lnd.stateService.getState();
			if (res.isErr()) {
				return resolve(err(res.error));
			}

			state = res.value;
		}

		await dispatch({
			type: actions.UPDATE_LIGHTNING_STATE,
			payload: state,
		});
		resolve(ok('LND state refreshed'));
	});
};

/**
 * Updates the lightning store with the latest GetInfo response from LND
 * @returns {(dispatch) => Promise<unknown>}
 */
export const refreshLightningInfo = (): Promise<Result<string>> => {
	return new Promise(async (resolve) => {
		const res = await lnd.getInfo();
		if (res.isErr()) {
			return resolve(err(res.error));
		}

		await dispatch({
			type: actions.UPDATE_LIGHTNING_INFO,
			payload: res.value,
		});
		resolve(ok('LND info refreshed'));
	});
};

/**
 * Updates the lightning store with the latest ChannelBalance response from LND
 * @returns {(dispatch) => Promise<unknown>}
 */
export const refreshLightningChannelBalance = (): Promise<Result<string>> => {
	return new Promise(async (resolve) => {
		const res = await lnd.getChannelBalance();
		if (res.isErr()) {
			return resolve(err(res.error));
		}

		await dispatch({
			type: actions.UPDATE_LIGHTNING_CHANNEL_BALANCE,
			payload: res.value,
		});

		resolve(ok('LND channel balance refreshed'));
	});
};

/**
 * Updates the lightning store with latest invoices and payments and then updates the activity list.
 * @returns {Promise<Ok<string> | Err<string>>}
 */
export const refreshLightningTransactions = (): Promise<Result<string>> => {
	return new Promise(async (resolve) => {
		await Promise.all([refreshLightningPayments(), refreshLightningInvoices()]);
		await updateLightingActivityList();
		resolve(ok('LND transactions refreshed'));
	});
};

/**
 * Updates the lightning store with complete invoice list
 * @return {Promise<Ok<string> | Err<string>>}
 */
const refreshLightningInvoices = (): Promise<Result<string>> => {
	return new Promise(async (resolve) => {
		const res = await lnd.listInvoices();
		if (res.isErr()) {
			return resolve(err(res.error));
		}

		if (res.value.invoices.length === 0) {
			return resolve(ok('No LND invoices'));
		}

		await dispatch({
			type: actions.UPDATE_LIGHTNING_INVOICES,
			payload: res.value,
		});

		resolve(ok('LND invoices refreshed'));
	});
};

/**
 * Updates the lightning store with complete payments list
 * @returns {Promise<Ok<string> | Err<string>>}
 */
const refreshLightningPayments = (): Promise<Result<string>> => {
	return new Promise(async (resolve) => {
		const res = await lnd.listPayments();
		if (res.isErr()) {
			return resolve(err(res.error));
		}

		if (res.value.payments.length === 0) {
			return resolve(ok('No LND payments'));
		}

		await dispatch({
			type: actions.UPDATE_LIGHTNING_PAYMENTS,
			payload: res.value,
		});

		resolve(ok('LND payments refreshed'));
	});
};

/**
 * Listens and polls for LND updates
 * @returns {Promise<void>}
 */
const subscribeToLndInfo = async (): Promise<void> => {
	//Poll for the calls we can't subscribe to
	await pollLndGetInfo();

	lnd.subscribeToInvoices(
		async (res) => {
			if (res.isOk()) {
				const { value, memo, settled } = res.value;

				await Promise.all([
					refreshLightningChannelBalance(),
					refreshLightningInvoices(),
				]);

				await updateLightingActivityList();

				if (settled) {
					showSuccessNotification({
						title: `Received ${value} sats`,
						message: `Invoice for "${memo}" was paid`,
					});
				}
			}
		},
		(res) => {
			//If this fails ever then we probably need to subscribe again
			showErrorNotification({
				title: 'Failed to subscribe to invoices',
				message: JSON.stringify(res),
			});
		},
	);

	//Any channel opening/closing triggers a new static channel state backup
	lnd.subscribeToBackups(
		() => {
			performFullBackup({ retries: 3, retryTimeout: 1000 }).catch();
		},
		() => {},
	);
};

let pollLndGetInfoTimeout;
/**
 * Keeps polling the LND service so values are kept up to date.
 * TODO: Attempt to subscribe to some of these requests instead of polling
 * @returns {Promise<void>}
 */
const pollLndGetInfo = async (): Promise<void> => {
	clearTimeout(pollLndGetInfoTimeout); //If previously subscribed make sure we don't keep have more than 1

	await Promise.all([refreshLightningInfo(), refreshLightningChannelBalance()]);

	pollLndGetInfoTimeout = setTimeout(pollLndGetInfo, 3000);
};

/**
 * Pay lightning invoice and refresh channel balances after successful payment
 * @param paymentRequest
 * @returns {Promise<{error: boolean, data: string}>}
 */
export const payLightningRequest = (
	paymentRequest: string,
): Promise<Result<lnrpc.IRoute>> => {
	return new Promise(async (resolve) => {
		const res = await lnd.payInvoice(paymentRequest);
		if (res.isErr()) {
			return resolve(err(res.error));
		}

		if (res.value.paymentError) {
			return resolve(err(new Error(res.value.paymentError)));
		}

		await Promise.all([
			refreshLightningChannelBalance(),
			refreshLightningPayments(),
		]);

		//Keep the activity list store up to date as well
		await updateLightingActivityList();

		//paymentRoute exists when there is no paymentError
		resolve(ok(res.value.paymentRoute!));
	});
};

/**
 * Claims a lightning channel from a lnurl-channel string
 * @param lnurl
 * @returns {Promise<Ok<boolean> | Err<boolean>>}
 */
export const claimChannelFromLnurlString = (
	lnurl: string,
): Promise<Result<string>> => {
	return new Promise(async (resolve) => {
		const res = await getLNURLParams(lnurl);
		if (res.isErr()) {
			return resolve(err(res.error));
		}

		const params = res.value as LNURLChannelParams;
		if (params.tag !== 'channelRequest') {
			return resolve(err('Not a channel request lnurl'));
		}

		resolve(claimChannel(params));
	});
};

/**
 * Claims a lightning channel from a decoded lnurl-channel request
 * @param params
 * @returns {Promise<Ok<boolean> | Err<boolean>>}
 */
export const claimChannel = (
	params: LNURLChannelParams,
): Promise<Result<string>> => {
	return new Promise(async (resolve) => {
		const connectRes = await lnd.connectPeerFromUri(params.uri);
		if (
			connectRes.isErr() &&
			connectRes.error.message.indexOf('already connected to peer') < 0
		) {
			return resolve(err(connectRes.error));
		}

		const infoRes = await lnd.getInfo();
		if (infoRes.isErr()) {
			return resolve(err(infoRes.error));
		}

		const lnurlRes = await lnurlChannel({
			params,
			isPrivate: true,
			cancel: false,
			localNodeId: infoRes.value.identityPubkey,
		});

		if (lnurlRes.isErr()) {
			return resolve(err(lnurlRes.error));
		}

		resolve(ok(lnurlRes.value));
	});
};

/**
 * Updates the progress state for downloading/unzipping the cached neutrino files
 *
 * @param state
 */
export const updateCachedNeutrinoDownloadState = async (
	state: ICachedNeutrinoDBDownloadState,
): Promise<Result<string>> => {
	await dispatch({
		type: actions.UPDATE_LIGHTNING_CACHED_NEUTRINO,
		payload: state,
	});

	return ok('LND payments refreshed');
};

/*
 * This resets the lightning store to defaultLightningShape
 */
export const resetLightningStore = (): Result<string> => {
	dispatch({
		type: actions.RESET_LIGHTNING_STORE,
	});
	return ok('');
};
