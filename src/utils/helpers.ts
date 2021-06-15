import Keychain from 'react-native-keychain';
import NetInfo from '@react-native-community/netinfo';
import { IGetKeychainValue, IResponse, ISetKeychainValue } from './types';
import {
	TBitcoinAbbreviation,
	TBitcoinLabel,
	TBitcoinUnit,
	TTicker,
} from '../store/types/wallet';
import { TAvailableNetworks } from './networks';
import Clipboard from '@react-native-community/clipboard';
import { Alert, Vibration } from 'react-native';
import { default as bitcoinUnits } from 'bitcoin-units';
import { err, ok, Result } from './result';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';

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
		return connectionInfo.isConnected === true;
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

//WARNING: This will wipe the specified key's value from storage
export const resetKeychainValue = async ({
	key = '',
}: {
	key: string;
}): Promise<Result<boolean>> => {
	try {
		const result = await Keychain.resetGenericPassword({ service: key });
		return ok(result);
	} catch (e) {
		console.log(e);
		return err(e);
	}
};

interface IGetNetworkData {
	selectedNetwork?: TAvailableNetworks;
	bitcoinUnit?: TBitcoinUnit;
}
interface IGetNetworkDataResponse {
	abbreviation: TBitcoinAbbreviation;
	label: TBitcoinLabel;
	ticker: TTicker;
}
/**
 *
 * @param selectedNetwork {string}
 * @param bitcoinUnit {string}
 * @return {{ abbreviation: string, label: string, ticker: string }}
 */
export const getNetworkData = ({
	selectedNetwork = 'bitcoin',
	bitcoinUnit = 'satoshi',
}: IGetNetworkData): IGetNetworkDataResponse => {
	const abbreviation = bitcoinUnit === 'satoshi' ? 'sats' : 'BTC';
	try {
		switch (selectedNetwork) {
			case 'bitcoin':
				return { abbreviation, label: 'Bitcoin', ticker: 'BTC' };
			case 'bitcoinTestnet':
				return { abbreviation, label: 'Bitcoin Testnet', ticker: 'tBTC' };
			default:
				return { abbreviation, label: 'Bitcoin', ticker: 'BTC' };
		}
	} catch {
		return { abbreviation, label: 'Bitcoin', ticker: 'BTC' };
	}
};

export const displayAlert = (msg = '', title = ''): void => {
	try {
		Alert.alert(
			title,
			msg,
			[
				{
					text: 'Okay',
					onPress: (): null => null,
				},
				{ text: 'Copy', onPress: (): void => Clipboard.setString(msg) },
			],
			{ cancelable: false },
		);
	} catch {}
};

export const btcToSats = (balance = 0): number => {
	try {
		return bitcoinUnits(balance, 'BTC').to('satoshi').value();
	} catch (e) {
		return 0;
	}
};

export const getLastWordInString = (phrase = ''): string => {
	try {
		const n = phrase.split(' ');
		return n[n.length - 1];
	} catch (e) {
		return phrase;
	}
};

/**
 * Sum a specific value in an array of objects.
 * @param arr
 * @param value
 */
export const reduceValue = ({
	arr = [],
	value = '',
}: {
	arr: any[];
	value: string;
}): Result<number> => {
	try {
		if (!value) {
			return err('No value specified.');
		}
		return ok(
			arr.reduce((acc, cur) => {
				return acc + Number(cur[value]);
			}, 0) || 0,
		);
	} catch (e) {
		return err(e);
	}
};

export type TVibrate =
	| 'impactLight'
	| 'impactMedium'
	| 'impactHeavy'
	| 'notificationSuccess'
	| 'notificationWarning'
	| 'notificationError'
	| 'selection'
	| 'default';
/**
 * @param {TVibrate} type
 * @param {number} [pattern]
 */
export const vibrate = ({
	type = 'impactHeavy',
	pattern = 1000,
}: {
	type?: TVibrate;
	pattern?: number;
}): void => {
	try {
		if (type === 'default') {
			Vibration.vibrate(pattern);
			return;
		}
		const options = {
			enableVibrateFallback: true,
			ignoreAndroidSystemSettings: false,
		};
		ReactNativeHapticFeedback.trigger(type, options);
	} catch (e) {
		console.log(e);
	}
};

/**
 * Shuffles a given array.
 * @param {any[]} array
 * @return {any[]}
 */
export const shuffleArray = (array): any[] => {
	for (let i = array.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[array[i], array[j]] = [array[j], array[i]];
	}
	return array;
};

/**
 * Truncates strings with an ellipses
 * @param str
 * @param n
 * @returns {any}
 */
export const truncate = (str, n): string =>
	str.length > n ? str.substr(0, n - 1) + '...' : str;
