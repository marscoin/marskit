import { err, ok, Result } from '../result';
import { getKeychainValue, setKeychainValue } from '../helpers';
import { getStore } from '../../store/helpers';
import { ObdApi } from 'omnibolt-js';
import { IConnect, ILogin } from 'omnibolt-js/lib/types/types';
import { generateMnemonic } from '../wallet';
import {
	connectToOmnibolt,
	loginToOmnibolt,
} from '../../store/actions/omnibolt';
import { IOmniboltConnectData } from '../../store/types/omnibolt';
const obdapi = new ObdApi();

/**
 * Connect to a specified omnibolt server.
 * @param url
 */
export const connect = async ({
	url = '',
}: {
	url?: string;
}): Promise<Result<IConnect>> => {
	const connectResponse = await obdapi.connect({
		url,
	});
	if (connectResponse.isOk()) {
		return ok(connectResponse.value);
	}
	return err(connectResponse.error.message);
};

/**
 * Login
 * @param {Function} onLogin
 * @param {string} selectedWallet
 */
export const login = async ({
	onLogin = (): null => null,
	selectedWallet = undefined,
}: {
	onLogin?: (data: Result<ILogin>) => any;
	selectedWallet?: string | undefined;
}): Promise<Result<any>> => {
	if (!selectedWallet) {
		selectedWallet = getStore().wallet.selectedWallet;
	}
	const idResponse = await getOmniboltId({ selectedWallet });
	if (idResponse.isErr()) {
		return err(idResponse.error.message);
	}
	const loginResponse = await obdapi.logIn(idResponse.value, onLogin);
	if (loginResponse.isOk()) {
		return ok(loginResponse.value);
	}
	return err(loginResponse.error.message);
};

/**
 * Get omnibolt id to login.
 * @async
 * @return {{error: boolean, data: string}}
 */
export const getOmniboltId = async ({
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
 * Attmepts to create an omnibolt user id if none exists for a given wallet.
 * @param {string} selectedWallet
 */
export const createOmniboltId = async ({
	selectedWallet = undefined,
}: {
	selectedWallet?: string | undefined;
}): Promise<Result<string>> => {
	try {
		if (!selectedWallet) {
			selectedWallet = getStore().wallet.selectedWallet;
		}
		const omniboltIdResponse = await getOmniboltId({ selectedWallet });
		if (omniboltIdResponse.isErr()) {
			const key = getOmniboltKey({ selectedWallet });
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
 * Returns the key used in 'getKeychainValue' that stores the omnibolt user id for the selected wallet.
 * @param {string} selectedWallet
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
 */
export const startOmnibolt = async ({
	selectedWallet = undefined,
}: {
	selectedWallet?: string | undefined;
}): Promise<void> => {
	try {
		if (!selectedWallet) {
			selectedWallet = getStore().wallet.selectedWallet;
		}
		//Create omnibolt user if necessary.
		await createOmniboltId({ selectedWallet });
		//Connect to an omnibolt server.
		const connectResponse = await connectToOmnibolt({});
		if (connectResponse.isOk()) {
			//Login using the stored omnibolt user id.
			await loginToOmnibolt({ selectedWallet });
		}
	} catch {}
};

export const connectToPeer = ({ nodeAddress = '' }): Promise<string> => {
	return new Promise((resolve) => {
		try {
			obdapi.connectPeer(
				{
					remote_node_address: nodeAddress,
				},
				(data) => {
					//onConnectPeer(data);
					return resolve(data);
				},
			);
		} catch {}
	});
};

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
 * Returns the id used to connect to other peers.
 */
export const getConnectPeerInfo = (): string => {
	try {
		const {
			nodeAddress,
			nodePeerId,
			userPeerId,
		} = getStore().omnibolt.userData;
		return JSON.stringify({
			nodeAddress,
			nodePeerId,
			userPeerId,
		});
	} catch {
		return '';
	}
};
