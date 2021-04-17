import actions from './actions';
import { getDispatch } from '../helpers';
import { err, ok, Result } from '../../utils/result';
import { getSelectedWallet } from '../../utils/wallet';
import { resetKeychainValue } from '../../utils/helpers';
import { deleteOmniboltId } from '../../utils/omnibolt';
import { wipeAuthDetails } from '../../utils/backup/backpack';
import { wipeLndDir } from '../../utils/lightning';

const dispatch = getDispatch();

export const updateSettings = (payload): Result<string> => {
	dispatch({
		type: actions.UPDATE_SETTINGS,
		payload,
	});
	return ok('');
};

/*
 * This resets the settings store to defaultSettingsShape
 */
export const resetSettingsStore = (): Result<string> => {
	dispatch({
		type: actions.RESET_SETTINGS_STORE,
	});
	return ok('');
};

/**
 * This method will wipe all data for the specified wallet.
 * @async
 * @param {string} [selectedWallet]
 * @return {Promise<Result<string>>}
 */
export const wipeWallet = async ({
	selectedWallet = undefined,
}: {
	selectedWallet?: string | undefined;
}): Promise<Result<string>> => {
	try {
		if (!selectedWallet) {
			selectedWallet = getSelectedWallet();
		}

		await Promise.all([
			resetKeychainValue({ key: selectedWallet }),
			resetKeychainValue({ key: `${selectedWallet}passphrase` }),
			deleteOmniboltId({ selectedWallet }),
			wipeAuthDetails(),
			resetKeychainValue({ key: 'lndMnemonic' }),
			wipeLndDir(),
		]);
		dispatch({
			type: actions.WIPE_WALLET,
		});

		return ok('');
	} catch (e) {
		console.log(e);
		return err(e);
	}
};
