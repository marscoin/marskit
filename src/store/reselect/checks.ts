import Store from '../types';
import { createSelector } from '@reduxjs/toolkit';
import { TWalletName } from '../types/wallet';
import { IChecksContent, TStorageWarning } from '../types/checks';
import { TAvailableNetworks } from '../../utils/networks';

export const checksState = (state: Store): IChecksContent => state.checks;

/**
 * Returns the warnings for a given wallet.
 */
export const warningsSelector = createSelector(
	[
		checksState,
		(_checks, selectedWallet: TWalletName): TWalletName => selectedWallet,
		(_checks, _selectedWallet, selectedNetwork): TAvailableNetworks =>
			selectedNetwork,
	],
	(checks, selectedWallet, selectedNetwork): TStorageWarning[] =>
		checks[selectedWallet].warnings[selectedNetwork],
);
