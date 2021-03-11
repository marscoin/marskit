import { Client } from 'backpack-host';
import bint from 'bint8array';
import { Readable, Duplex } from 'streamx';
import WSStream from 'webnet/websocket';
import { bytesToString, stringToBytes } from '../converters';
import { err, ok, Result } from '../result';
import { getKeychainValue, setKeychainValue } from '../helpers';

const serverInfo = {
	id: bint.fromString('test123'),
	url: 'wss://backpack.synonym.to',
};

enum BackpackKeychainKeys {
	username = 'backpackUsername',
	password = 'backpackPassword',
}

interface IBackpackAuth {
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
		username = (await getKeychainValue({ key: BackpackKeychainKeys.username }))
			.data;
		password = (await getKeychainValue({ key: BackpackKeychainKeys.username }))
			.data;
	}

	//If we didn't get passed auth details and none were found in the keychain then we can't proceed
	if (!username || !password) {
		throw new Error('No backpack auth details provided');
	}

	return new Client(bint.fromString(username), bint.fromString(password), {
		connect: (info, cb): void => {
			const socket = new WebSocket(info.url);
			socket.onerror = (socketErr): void => cb(socketErr);

			// socket must have stream api
			const ws = new WSStream(socket, {
				onconnect: (): void => cb(null, ws),
			});
		},
	});
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
 * Registers a new user on the Backpack server
 * @param auth
 * @returns {Promise<Ok<string> | Err<string>>}
 */
export const backpackRegister = async (
	auth: IBackpackAuth,
): Promise<Result<string>> => {
	try {
		const client = await clientFactory(auth);

		return new Promise((resolve) => {
			client.register(serverInfo, (registerErr) => {
				if (registerErr) {
					resolve(err(registerErr));
				}

				saveAuthDetails(auth)
					.then(() => {
						resolve(ok('Registered'));
					})
					.catch((e) => {
						resolve(err(e));
					});
			});
		});
	} catch (e) {
		return err(e);
	}
};

/**
 * Stores a string on the backpack server
 * @param backup
 * @returns {Promise<Ok<string> | Err<string>>}
 */
export const backpackStore = async (
	backup: string,
): Promise<Result<string>> => {
	try {
		const client = await clientFactory();

		return new Promise((resolve) => {
			client.store(serverInfo, (storeErr, str) => {
				if (storeErr) {
					resolve(err(storeErr));
				}

				Readable.from(stringToBytes(backup)).pipe(str);

				resolve(ok('Stored successfully'));
			});
		});
	} catch (e) {
		return err(e);
	}
};

/**
 * Retrieves a string from the backpack server
 * @returns {Promise<Ok<string> | Err<string>>}
 */
export const backpackRetrieve = async (): Promise<Result<string>> => {
	try {
		const client = await clientFactory();

		return new Promise((resolve) => {
			client.retrieve(serverInfo, (retrieveErr, channel) => {
				if (retrieveErr) {
					resolve(err(retrieveErr));
				}

				channel.pipe(
					new Duplex({
						write(data, cb) {
							resolve(ok(bytesToString(data)));
							cb();
						},
					}),
				);
			});
		});
	} catch (e) {
		return err(e);
	}
};
