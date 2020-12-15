import Keychain from 'react-native-keychain';
import NetInfo from '@react-native-community/netinfo';
import { IGetKeychainValue, IResponse, ISetKeychainValue } from './types';

export const promiseTimeout = (
	ms: number,
	promise: Promise<any>,
): Promise<IResponse<any> | any> => {
	let id;
	let timeout = new Promise((resolve) => {
		id = setTimeout(() => {
			resolve({ error: true, data: 'Timed Out.' });
		}, ms);
	});
	return Promise.race([promise, timeout]).then((result) => {
		clearTimeout(id);
		return result;
	});
};

export const setKeychainValue = async ({
	key = '',
	value = '',
}: ISetKeychainValue): Promise<IResponse<string>> => {
	return new Promise(async (resolve) => {
		try {
			await Keychain.setGenericPassword(key, value, { service: key });
			resolve({ error: false, data: '' });
		} catch (e) {
			resolve({ error: true, data: e });
		}
	});
};

export const isOnline = async (): Promise<boolean> => {
	try {
		const connectionInfo = await NetInfo.fetch();
		return connectionInfo.isConnected;
	} catch {
		return false;
	}
};

export const getKeychainValue = async ({
	key = '',
}: IGetKeychainValue): Promise<{ error: boolean; data: string }> => {
	return new Promise(async (resolve) => {
		try {
			let result = await Keychain.getGenericPassword({ service: key });
			let data: string | undefined;
			if (!result) {
				return resolve({ error: true, data: '' });
			}
			if (!result.password) {
				return resolve({ error: true, data: '' });
			}
			data = result.password;
			resolve({ error: false, data });
		} catch (e) {
			resolve({ error: true, data: e });
		}
	});
};
