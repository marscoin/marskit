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
import { Alert } from 'react-native';
import { default as bitcoinUnits } from 'bitcoin-units';

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

export const getFiatBalance = ({
	balance = 0,
	exchangeRate = 0,
	selectedCurrency = 'usd',
}: {
	balance: number;
	exchangeRate: number;
	selectedCurrency?: string;
}): string => {
	try {
		bitcoinUnits.setFiat(selectedCurrency.toLowerCase(), exchangeRate);
		const fiatBalance = bitcoinUnits(balance, 'satoshi')
			.to('usd')
			.value()
			.toFixed(2);
		if (isNaN(fiatBalance)) {
			return '0';
		}
		return fiatBalance;
	} catch (e) {
		return '0';
	}
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
