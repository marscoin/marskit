import { MMKV } from 'react-native-mmkv';
import AsyncStorage from '../../__mocks__/@react-native-async-storage/async-storage';

const storage = new MMKV();

export const mmkvStorage: AsyncStorage = {
	setItem: (key, value) => {
		storage.set(key, value);
		return Promise.resolve(true);
	},
	getItem: (key) => {
		const value = storage.getString(key);
		//@ts-ignore
		return Promise.resolve(value);
	},
	removeItem: (key) => {
		storage.delete(key);
		return Promise.resolve();
	},
};

export default mmkvStorage;
