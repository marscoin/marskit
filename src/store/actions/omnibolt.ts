import actions from './actions';
import { err, ok, Result } from '../../utils/result';
import { getDispatch, getStore } from '../helpers';
import { TAvailableNetworks } from '../../utils/networks';
import { IConnect, ILogin } from 'omnibolt-js/lib/types/types';
import * as omnibolt from '../../utils/omnibolt';
import { IOmniboltConnectData } from '../types/omnibolt';
import { getSelectedNetwork, getSelectedWallet } from '../../utils/wallet';
import { createOmniboltId } from '../../utils/omnibolt';
import { defaultOmniboltWalletShape } from '../shapes/omnibolt';

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
	url?: string;
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
 * @param selectedWallet
 * @param selectedNetwork
 */
export const updateOmniboltConnectData = ({
	data,
	selectedWallet = undefined,
	selectedNetwork = undefined,
}: {
	data: IOmniboltConnectData;
	selectedWallet: string | undefined;
	selectedNetwork: TAvailableNetworks | undefined;
}): Result<string> => {
	if (!data?.nodeAddress || !data?.nodePeerId || !data?.userPeerId) {
		return err('Invalid Data');
	}
	if (!selectedNetwork) {
		selectedNetwork = getSelectedNetwork();
	}
	if (!selectedWallet) {
		selectedWallet = getSelectedWallet();
	}
	dispatch({
		type: actions.UPDATE_OMNIBOLT_CONNECTDATA,
		payload: { data, selectedWallet, selectedNetwork },
	});
	return ok('Connect Data Updated.');
};

export const onConnectPeer = ({
	data = {},
	selectedWallet = undefined,
	selectedNetwork = undefined,
}: {
	data: any;
	selectedWallet?: string | undefined;
	selectedNetwork?: TAvailableNetworks | undefined;
}): Result<string> => {
	if (!selectedNetwork) {
		selectedNetwork = getSelectedNetwork();
	}
	if (!selectedWallet) {
		selectedWallet = getSelectedWallet();
	}
	dispatch({
		type: actions.UPDATE_OMNIBOLT_PEERS,
		payload: { data, selectedNetwork, selectedWallet },
	});
	return ok('Connect Data Updated.');
};

export const createOmniboltWallet = async ({
	selectedWallet = undefined,
}: {
	selectedWallet?: string | undefined;
}): Promise<Result<string>> => {
	if (!selectedWallet) {
		selectedWallet = getSelectedWallet();
	}
	// Check that this wallet doesn't already exist.
	if (getStore().omnibolt?.wallets[selectedWallet]) {
		return ok('Wallet already exists.');
	}
	// Create login id for the new wallet.
	const idResponse = await createOmniboltId({ selectedWallet });
	if (idResponse.isErr()) {
		return err(idResponse.error.message);
	}
	const payload = {
		[selectedWallet]: defaultOmniboltWalletShape,
	};

	await dispatch({
		type: actions.CREATE_OMNIBOLT_WALLET,
		payload,
	});
	return ok('Connect Data Updated.');
};
