import actions from './actions';
import {
	ICreateLightningWallet,
	IUnlockLightningWallet,
} from '../types/lightning';
import { getDispatch } from '../helpers';
import lnd, {
	lnrpc,
	LndConf,
	ENetworks as LndNetworks,
	ICachedNeutrinoDBDownloadState,
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

const dispatch = getDispatch();

const password = 'shhhhhhhh123'; //TODO use keychain stored password

/**
 * Starts the LND service
 * @param network
 * @returns {Promise<unknown>}
 */
export const startLnd = (network: LndNetworks): Promise<Result<string>> => {
	return new Promise(async (resolve) => {
		const stateRes = await lnd.currentState();
		if (stateRes.isOk() && stateRes.value.lndRunning) {
			await dispatch({
				type: actions.UPDATE_LIGHTNING_STATE,
				payload: stateRes.value,
			});

			return resolve(ok('LND already started')); //Already running
		}

		const lndConf = new LndConf(network, getCustomLndConf(network));

		const res = await lnd.start(lndConf);
		if (res.isErr()) {
			return resolve(err(res.error));
		}

		await connectToDefaultPeer();

		await refreshLightningState();
		lnd.subscribeToCurrentState((state) => {
			dispatch({
				type: actions.UPDATE_LIGHTNING_STATE,
				payload: state,
			});

			if (state.walletUnlocked) {
				refreshLightningTransactions().then();
			}
		});

		//Any channel opening/closing triggers a new static channel state backup
		lnd.subscribeToBackups(
			() => {
				performFullBackup({ retries: 3, retryTimeout: 1000 });
			},
			() => {},
		);

		resolve(ok('LND started'));
	});
};

/**
 * Creates a new LND wallet
 * @param password
 * @param mnemonic
 * @param network
 * @returns {Promise<unknown>}
 */
export const createLightningWallet = ({
	network,
}: ICreateLightningWallet): Promise<Result<string>> => {
	return new Promise(async (resolve) => {
		const existsRes = await lnd.walletExists(network);
		if (existsRes.isOk() && existsRes.value) {
			return resolve(err('LND wallet already exists'));
		}

		let lndSeed: string[] = [];

		let seedStr = (await getKeychainValue({ key: 'lndMnemonic' })).data; //Set if wallet is being restored from a backup
		if (seedStr) {
			lndSeed = seedStr.split(' ');
		} else {
			const seedRes = await lnd.genSeed();
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

		const createRes = await lnd.createWallet(
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

		//Attempt to connect to default peer from the start so it's ready when the channel needs to be opened
		await connectToDefaultPeer();

		subscribeToLndUpdates().then();

		resolve(ok('LND wallet created'));
	});
};

/**
 * Unlocks an existing LND wallet if one exists
 * @param password
 * @param network
 * @returns {Promise<unknown>}
 */
export const unlockLightningWallet = ({
	network,
}: IUnlockLightningWallet): Promise<Result<string>> => {
	return new Promise(async (resolve) => {
		const stateRes = await lnd.currentState();
		if (stateRes.isOk() && stateRes.value.grpcReady) {
			subscribeToLndUpdates().then();
			return resolve(ok('Wallet already unlocked')); //Wallet already unlocked
		}

		const existsRes = await lnd.walletExists(network);
		if (existsRes.isOk() && !existsRes.value) {
			return resolve(err('LND wallet does not exist'));
		}

		const unlockRes = await lnd.unlockWallet(password);
		if (unlockRes.isErr()) {
			return resolve(err(unlockRes.error));
		}

		await dispatch({
			type: actions.UNLOCK_LIGHTNING_WALLET,
		});

		subscribeToLndUpdates().then();

		resolve(ok('Wallet unlocked'));
	});
};

/**
 * Updates the lightning store with the latest state of LND
 * @returns {(dispatch) => Promise<unknown>}
 */
export const refreshLightningState = (): Promise<Result<string>> => {
	return new Promise(async (resolve) => {
		const res = await lnd.currentState();
		if (res.isErr()) {
			return resolve(err(res.error));
		}

		await dispatch({
			type: actions.UPDATE_LIGHTNING_STATE,
			payload: res.value,
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
const subscribeToLndUpdates = async (): Promise<void> => {
	//If grpc hasn't even started yet wait and try again
	const stateRes = await lnd.currentState();
	if (stateRes.isOk() && !stateRes.value.grpcReady) {
		setTimeout(subscribeToLndUpdates, 1000);
		return;
	}

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
