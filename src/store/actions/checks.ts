import actions from './actions';
import { getDispatch } from '../helpers';
import { TWalletName } from '../types/wallet';
import { getSelectedNetwork, getSelectedWallet } from '../../utils/wallet';
import { TAvailableNetworks } from '../../utils/networks';
import { TStorageWarning } from '../types/checks';

const dispatch = getDispatch();

/**
 * Adds a single warning.
 * @param {TStorageWarning} warning
 * @param {TWalletName} [selectedWallet]
 * @param {TAvailableNetworks} [selectedNetwork]
 * @returns {string}
 */
export const addWarning = ({
	warning,
	selectedWallet,
	selectedNetwork,
}: {
	warning: TStorageWarning;
	selectedWallet?: TWalletName;
	selectedNetwork?: TAvailableNetworks;
}): void => {
	if (!selectedWallet) {
		selectedWallet = getSelectedWallet();
	}
	if (!selectedNetwork) {
		selectedNetwork = getSelectedNetwork();
	}

	dispatch({
		type: actions.ADD_WARNING,
		payload: {
			warning,
			selectedWallet,
			selectedNetwork,
		},
	});
};
