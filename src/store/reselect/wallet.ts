import Store from '../types';
import { createSelector } from '@reduxjs/toolkit';
import {
	defaultBitcoinTransactionData,
	IAddressTypes,
	IBitcoinTransactionData,
	IBoostedTransaction,
	IDefaultWalletShape,
	IFormattedTransaction,
	IFormattedTransactionContent,
	IWallet,
} from '../types/wallet';
import { TAvailableNetworks } from '../../utils/networks';
import { IExchangeRates } from '../../utils/exchange-rate/types';

export const walletState = (state: Store): IWallet => state.wallet;
export const walletsState = (
	state: Store,
): { [key: string]: IDefaultWalletShape } => state.wallet.wallets;
export const exchangeRatesState = (state: Store): IExchangeRates =>
	state.wallet.exchangeRates;
export const selectedWalletState = (state: Store): string =>
	state.wallet.selectedWallet;
export const selectedNetworkState = (state: Store): TAvailableNetworks =>
	state.wallet.selectedNetwork;
export const addressTypesState = (state: Store): IAddressTypes =>
	state.wallet.addressTypes;

/**
 * Returns the selected wallet id.
 */
export const selectedWalletSelector = createSelector(
	selectedWalletState,
	(selectedWallet): string => selectedWallet,
);

/**
 * Returns the selected network id (TAvailableNetworks)
 */
export const selectedNetworkSelector = createSelector(
	selectedNetworkState,
	(selectedNetwork): TAvailableNetworks => selectedNetwork,
);

/**
 * Returns wallet data for the currently selected wallet.
 */
export const currentWalletSelector = createSelector(
	[
		walletsState,
		(currentWallet, selectedWallet: string): string => selectedWallet,
	],
	(currentWallet, selectedWallet) => {
		return currentWallet[selectedWallet];
	},
);

export const addressTypeSelector = createSelector(
	[
		walletsState,
		(wallets, selectedWallet: string): string => selectedWallet,
		(wallets, selectedWallet, selectedNetwork): TAvailableNetworks =>
			selectedNetwork,
	],
	(wallets, selectedWallet, selectedNetwork) => {
		return wallets[selectedWallet].addressType[selectedNetwork];
	},
);

/**
 * Returns wallet data for the currently selected wallet.
 */
export const exchangeRatesSelector = createSelector(
	exchangeRatesState,
	(exchangeRates) => {
		return exchangeRates;
	},
);

/**
 * Returns object of on-chain transactions for the currently selected wallet & network.
 */
export const transactionsSelector = createSelector(
	[
		walletsState,
		(currentWallet, selectedWallet: string): string => selectedWallet,
		(
			currentWallet,
			selectedWallet,
			selectedNetwork: TAvailableNetworks,
		): TAvailableNetworks => selectedNetwork,
	],
	(currentWallet, selectedWallet, selectedNetwork): IFormattedTransaction => {
		return currentWallet[selectedWallet].transactions[selectedNetwork] || {};
	},
);

/**
 * Returns transaction data for the currently selected wallet & network.
 */
export const transactionSelector = createSelector(
	[
		walletsState,
		(currentWallet, selectedWallet: string): string => selectedWallet,
		(
			currentWallet,
			selectedWallet,
			selectedNetwork: TAvailableNetworks,
		): TAvailableNetworks => selectedNetwork,
	],
	(currentWallet, selectedWallet, selectedNetwork): IBitcoinTransactionData => {
		return (
			currentWallet[selectedWallet].transaction[selectedNetwork] ||
			defaultBitcoinTransactionData
		);
	},
);

/**
 * Returns boosted transactions for the currently selected wallet & network.
 */
export const boostedTransactionsSelector = createSelector(
	[
		walletsState,
		(currentWallet, selectedWallet: string): string => selectedWallet,
		(
			currentWallet,
			selectedWallet,
			selectedNetwork: TAvailableNetworks,
		): TAvailableNetworks => selectedNetwork,
	],
	(currentWallet, selectedWallet, selectedNetwork): IBoostedTransaction => {
		return (
			currentWallet[selectedWallet].boostedTransactions[selectedNetwork] || {}
		);
	},
);

/**
 * Returns unconfirmed transactions for the currently selected wallet & network.
 */
export const unconfirmedTransactionsSelector = createSelector(
	[
		walletsState,
		(currentWallet, selectedWallet: string): string => selectedWallet,
		(
			currentWallet,
			selectedWallet,
			selectedNetwork: TAvailableNetworks,
		): TAvailableNetworks => selectedNetwork,
	],
	(
		currentWallet,
		selectedWallet,
		selectedNetwork,
	): IFormattedTransactionContent[] => {
		const transactions: IFormattedTransaction =
			currentWallet[selectedWallet].transactions[selectedNetwork] || {};
		return Object.values(transactions).filter((tx) => tx.height < 1);
	},
);

/**
 * Returns the selected wallet id.
 */
export const walletSelector = createSelector(
	walletState,
	(wallet): IWallet => wallet,
);

/**
 * Returns the current on-chain balance.
 */
export const onChainBalanceSelector = createSelector(
	walletState,
	(wallet): number => {
		const selectedWallet = wallet.selectedWallet;
		const selectedNetwork = wallet.selectedNetwork;
		return wallet.wallets[selectedWallet]?.balance[selectedNetwork] || 0;
	},
);

export const addressTypesSelector = createSelector(
	addressTypesState,
	(addressTypes): IAddressTypes => addressTypes,
);
