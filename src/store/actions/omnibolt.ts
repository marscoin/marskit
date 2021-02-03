import actions from './actions';
import { err, ok, Result } from '../../utils/result';
import { getDispatch, getStore } from '../helpers';
import { TAvailableNetworks } from '../../utils/networks';
import { IConnect, ILogin } from 'omnibolt-js/lib/types/types';
import * as omnibolt from '../../utils/omnibolt';
import { IOmniboltConnectData } from '../types/omnibolt';

const dispatch = getDispatch();

export const updateOmnibolt = (payload): Result<string> => {
	dispatch({
		type: actions.UPDATE_OMNIBOLT,
		payload,
	});
	return ok('');
};

/*
 * This resets the omnibolt store to defaultOmniBoltShape
 */
export const resetOmniBoltStore = (): Result<string> => {
	dispatch({
		type: actions.RESET_OMNIBOLT_STORE,
	});
	return ok('');
};

/**
 * Connects to the specified omnibolt server and updates omnibolt.userData info with the response.
 * @param {string} url
 */
export const connectToOmnibolt = async ({
	url = '',
}: {
	url?: TAvailableNetworks | '';
}): Promise<Result<IConnect>> => {
	const connectResponse = await omnibolt.connect({
		url,
	});
	if (connectResponse.isErr()) {
		return err(connectResponse.error.message);
	}
	// Ensure we're getting the necessary data.
	if (!connectResponse.value?.recipient_node_peer_id) {
		return err(connectResponse.value.toString());
	}
	dispatch({
		type: actions.UPDATE_OMNIBOLT_USERDATA,
		payload: connectResponse.value,
	});
	return ok(connectResponse.value);
};

export const loginToOmnibolt = async ({
	selectedWallet = undefined,
}: {
	selectedWallet: string | undefined;
}): Promise<Result<ILogin>> => {
	return new Promise(async (resolve) => {
		if (!selectedWallet) {
			selectedWallet = getStore().wallet.selectedWallet;
		}
		await omnibolt.login({
			selectedWallet,
			onLogin: (data) => {
				onLogin(data);
				return resolve(data);
			},
		});
	});
};

/**
 * Passed as a callback to omnibolt-js, this method is used to store and save returned login data.
 * @param data
 */
export const onLogin = async (
	data: Result<ILogin>,
): Promise<Result<ILogin>> => {
	if (data.isErr()) {
		return err(data.error);
	}
	if (!data.value?.nodeAddress) {
		return err(data.value.toString());
	}
	dispatch({
		type: actions.UPDATE_OMNIBOLT_USERDATA,
		payload: data.value,
	});
	return ok(data.value);
};

/**
 * connectData is used to temporarily store info when attempting to connect with a peer.
 * @param data
 */
export const updateOmniboltConnectData = (
	data: IOmniboltConnectData,
): Result<string> => {
	if (!data?.nodeAddress || !data?.nodePeerId || !data?.userPeerId) {
		return err('Invalid Data');
	}
	dispatch({
		type: actions.UPDATE_OMNIBOLT_CONNECTDATA,
		payload: data,
	});
	return ok('Connect Data Updated.');
};

/*
export const onConnectPeer = (data: any): void => {
	//TODO: Add peer to omnibolt peer list.
};*/
