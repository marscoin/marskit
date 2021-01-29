import actions from './actions';
import { err, ok, Result } from '../../utils/result';
import { getDispatch, getStore } from '../helpers';
import { TAvailableNetworks } from '../../utils/networks';
import { IConnect, ILogin } from 'omnibolt-js/lib/types/types';
import * as omnibolt from '../../utils/omnibolt';

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
	if (connectResponse.isOk()) {
		dispatch({
			type: actions.UPDATE_OMNIBOLT_USERDATA,
			payload: connectResponse.value,
		});
		return ok(connectResponse.value);
	}
	return err(connectResponse.error.message);
};

/**
 * Logs in to
 */
export const loginToOmnibolt = async ({
	selectedWallet = undefined,
}: {
	selectedWallet: string | undefined;
}): Promise<Result<IConnect>> => {
	if (!selectedWallet) {
		selectedWallet = getStore().wallet.selectedWallet;
	}
	const connectResponse = await omnibolt.login({ onLogin, selectedWallet });
	if (connectResponse.isErr()) {
		return err(connectResponse.error.message);
	}
	if (connectResponse.value) {
		dispatch({
			type: actions.UPDATE_OMNIBOLT_USERDATA,
			payload: connectResponse.value,
		});
	}
	return ok(connectResponse.value);
};

export const onLogin = async (
	data: Result<ILogin>,
): Promise<Result<ILogin>> => {
	if (data.isOk()) {
		dispatch({
			type: actions.UPDATE_OMNIBOLT_USERDATA,
			payload: data.value,
		});
		return ok(data.value);
	}
	return err(data.error.message);
};
