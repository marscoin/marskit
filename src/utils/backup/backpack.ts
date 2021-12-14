import { Client } from 'backpack-host';
import bint from 'bint8array';
import WSStream from 'webnet/websocket';
import { err, ok, Result } from '../result';
import {
	getKeychainValue,
	resetKeychainValue,
	setKeychainValue,
} from '../helpers';

//TODO move to config or .env
const serverInfo = {
	id: bint.fromString('test123'),
	url: 'wss://backpack.synonym.to',
};

enum BackpackKeychainKeys {
	username = 'backpackUsername',
	password = 'backpackPassword',
}

export interface IBackpackAuth {
	username: string;
	password: string;
}

/**
 * Username and password should be supplied on registration.
 * Is username and password is supplied those will be used.
 * If none are supplied the details found in the keychain will be used each time.
 * @param auth
 * @returns Client
 */
const clientFactory = async (auth?: IBackpackAuth): Client => {
	let username = '';
	let password = '';
	if (auth) {
		username = auth.username;
		password = auth.password;
	} else {
		username = await backpackUsername();
		password = await backpackPassword();
	}

	//If we didn't get passed auth details and none were found in the keychain then we can't proceed
	if (!username || !password) {
		throw new Error('No backpack auth details provided');
	}

	const client = new Client(
		bint.fromString(username),
		bint.fromString(password),
		function connect(info, cb) {
			const socket = new WebSocket(info.url);
			socket.onerror = (socketErr): void => cb(socketErr);

			// socket must have stream api
			const ws = new WSStream(socket, {
				onconnect: (): void => cb(null, ws),
			});
		},
	);

	try {
		await client.init({
			memlimit: 16777216, // crypto_pwhash_MEMLIMIT_MIN
			opslimit: 2, // crypto_pwhash_OPSLIMIT_MIN
		});
	} catch (e) {
		console.error(e);
		throw e;
	}

	return client;
};

/**
 * Saved backpack auth details to keychain
 * @param auth
 * @returns {Promise<void>}
 */
const saveAuthDetails = async (auth: IBackpackAuth): Promise<void> => {
	await setKeychainValue({
		key: BackpackKeychainKeys.username,
		value: auth.username,
	});
	await setKeychainValue({
		key: BackpackKeychainKeys.password,
		value: auth.password,
	});
};

/**
 * Wipes backpack auth details from keychain
 * @returns {Promise<void>}
 */
export const wipeAuthDetails = async (): Promise<void> => {
	await Promise.all([
		resetKeychainValue({
			key: BackpackKeychainKeys.username,
		}),
		resetKeychainValue({
			key: BackpackKeychainKeys.password,
		}),
	]);
};

/**
 * Gets backpack username. Returns empty string if not registered.
 * @return {Promise<string>}
 */
export const backpackUsername = async (): Promise<string> => {
	try {
		return (await getKeychainValue({ key: BackpackKeychainKeys.username }))
			.data;
	} catch (e) {
		return '';
	}
};

/**
 * Gets backpack password. Returns empty string if not registered.
 * @return {Promise<string>}
 */
export const backpackPassword = async (): Promise<string> => {
	try {
		return (await getKeychainValue({ key: BackpackKeychainKeys.password }))
			.data;
	} catch (e) {
		return '';
	}
};

/**
 * Registers a new user on the Backpack server
 * @param auth
 * @returns {Promise<Ok<string> | Err<string>>}
 */
export const backpackRegister = async (
	auth: IBackpackAuth,
): Promise<Result<string>> => {
	try {
		const client = await clientFactory(auth);

		await client.register(serverInfo);

		await saveAuthDetails(auth);

		return ok('Registered');
	} catch (e) {
		console.error(e);
		return err(e);
	}
};

/**
 * Stores a string on the backpack server
 * @param backup
 * @returns {Promise<Ok<string> | Err<string>>}
 */
export const backpackStore = async (
	backup: Uint8Array,
): Promise<Result<string>> => {
	try {
		//TODO place back once we can store the password hash. Freezes the app while hashing on each backup.
		// const client = await clientFactory();
		// await client.store(serverInfo, backup);

		return ok('Stored successfully');
	} catch (e) {
		return err(e);
	}
};

/**
 * Retrieves a string from the backpack server
 * @returns {Promise<Ok<string> | Err<string>>}
 */
export const backpackRetrieve = async (
	auth?: IBackpackAuth,
): Promise<Result<Uint8Array>> => {
	try {
		const client = await clientFactory(auth);

		const res = await client.retrieve(serverInfo);

		if (auth) {
			await saveAuthDetails(auth);
		}

		return ok(res);
	} catch (e) {
		return err(e);
	}
};
