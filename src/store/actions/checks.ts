import actions from './actions';
import { getDispatch } from '../helpers';
import { TWalletName } from '../types/wallet';
import { getSelectedNetwork, getSelectedWallet } from '../../utils/wallet';
import { TAvailableNetworks } from '../../utils/networks';
import { TStorageWarning } from '../types/checks';
import { getWarnings } from '../../utils/checks';

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

/**
 * Updates a single warning in the warnings array by id.
 * @param {TWalletName} [selectedWallet]
 * @param {TAvailableNetworks} [selectedNetwork]
 * @param {string} id
 * @param {TStorageWarning} warningData
 * @returns {TStorageWarning[]}
 */
export const updateWarning = ({
	selectedWallet,
	selectedNetwork,
	id,
	warningData,
}: {
	selectedWallet: TWalletName;
	selectedNetwork: TAvailableNetworks;
	id: string;
	warningData: TStorageWarning;
}): TStorageWarning[] => {
	if (!selectedWallet) {
		selectedWallet = getSelectedWallet();
	}

	if (!selectedNetwork) {
		selectedNetwork = getSelectedNetwork();
	}

	const warnings = getWarnings({ selectedWallet, selectedNetwork });
	const newWarnings = warnings.map((warning) => {
		if (warning.id === id) {
			return {
				...warning,
				...warningData,
			};
		}
		return warning;
	});

	dispatch({
		type: actions.UPDATE_WARNINGS,
		payload: {
			selectedWallet,
			selectedNetwork,
			warnings: newWarnings,
		},
	});
	return newWarnings;
};
