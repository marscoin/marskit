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
	IUtxo,
	IWallet,
	TAddressType,
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
	[walletState],
	(wallet): string => wallet.selectedWallet,
);

/**
 * Returns the selected network id (TAvailableNetworks)
 */
export const selectedNetworkSelector = createSelector(
	[walletState],
	(wallet): TAvailableNetworks => wallet.selectedNetwork,
);

/**
 * Returns wallet data for the currently selected wallet.
 * @param {Store} state
 * @param {string} selectedWallet
 * @returns {IDefaultWalletShape}
 */
export const currentWalletSelector = createSelector(
	[walletState, (wallet, selectedWallet: string): string => selectedWallet],
	(wallet, selectedWallet): IDefaultWalletShape => {
		return wallet.wallets[selectedWallet];
	},
);

/**
 * Returns the selected address type for a given wallet and network.
 * @param {Store} state
 * @param {string} selectedWallet
 * @param {TAvailableNetworks} selectedNetwork
 * @returns {TAddressType}
 */
export const addressTypeSelector = createSelector(
	[walletState],
	(wallet): TAddressType => {
		const selectedWallet = wallet.selectedWallet;
		const selectedNetwork = wallet.selectedNetwork;
		return wallet.wallets[selectedWallet].addressType[selectedNetwork];
	},
);

/**
 * Returns exchange rate information.
 */
export const exchangeRatesSelector = createSelector([walletState], (wallet) => {
	return wallet.exchangeRates;
});

/**
 * Returns object of on-chain transactions for the currently selected wallet & network.
 * @param {Store} state
 * @param {string} selectedWallet
 * @param {TAvailableNetworks} selectedNetwork
 * @returns {IFormattedTransaction}
 */
export const transactionsSelector = createSelector(
	[walletState],
	(wallet): IFormattedTransaction => {
		const selectedWallet = wallet.selectedWallet;
		const selectedNetwork = wallet.selectedNetwork;
		return wallet.wallets[selectedWallet].transactions[selectedNetwork] || {};
	},
);

/**
 * Returns transaction data for the currently selected wallet & network.
 * @param {Store} state
 * @param {string} selectedWallet
 * @param {TAvailableNetworks} selectedNetwork
 * @returns {IBitcoinTransactionData}
 */
export const transactionSelector = createSelector(
	[walletState],
	(wallet): IBitcoinTransactionData => {
		const selectedWallet = wallet.selectedWallet;
		const selectedNetwork = wallet.selectedNetwork;
		return (
			wallet.wallets[selectedWallet].transaction[selectedNetwork] ||
			defaultBitcoinTransactionData
		);
	},
);

/**
 * Returns transaction fee for the currently selected wallet & network.
 * @param {Store} state
 * @param {string} selectedWallet
 * @param {TAvailableNetworks} selectedNetwork
 * @returns {IBitcoinTransactionData}
 */
export const transactionFeeSelector = createSelector(
	[walletState],
	(wallet): number | undefined => {
		const selectedWallet = wallet.selectedWallet;
		const selectedNetwork = wallet.selectedNetwork;
		return (
			wallet.wallets[selectedWallet].transaction[selectedNetwork].fee ||
			defaultBitcoinTransactionData.fee
		);
	},
);

/**
 * Returns whether transaction is set to max for the currently selected wallet & network.
 * @param {Store} state
 * @param {string} selectedWallet
 * @param {TAvailableNetworks} selectedNetwork
 * @returns {IBitcoinTransactionData}
 */
export const transactionMaxSelector = createSelector(
	[walletState],
	(wallet): boolean => {
		const selectedWallet = wallet.selectedWallet;
		const selectedNetwork = wallet.selectedNetwork;
		return (
			wallet.wallets[selectedWallet].transaction[selectedNetwork].max ?? false
		);
	},
);

/**
 * Returns boosted transactions for the currently selected wallet & network.
 * @param {Store} state
 * @param {string} selectedWallet
 * @param {TAvailableNetworks} selectedNetwork
 * @returns {IBoostedTransaction}
 */
export const boostedTransactionsSelector = createSelector(
	[walletState],
	(wallet): IBoostedTransaction => {
		const selectedWallet = wallet.selectedWallet;
		const selectedNetwork = wallet.selectedNetwork;
		return (
			wallet.wallets[selectedWallet].boostedTransactions[selectedNetwork] || {}
		);
	},
);

/**
 * Returns unconfirmed transactions for the currently selected wallet & network.
 * @param {Store} state
 * @param {string} selectedWallet
 * @param {TAvailableNetworks} selectedNetwork
 * @returns {IFormattedTransactionContent[]}
 */
export const unconfirmedTransactionsSelector = createSelector(
	[walletState],
	(wallet): IFormattedTransactionContent[] => {
		const selectedWallet = wallet.selectedWallet;
		const selectedNetwork = wallet.selectedNetwork;
		const transactions: IFormattedTransaction =
			wallet.wallets[selectedWallet].transactions[selectedNetwork] || {};
		return Object.values(transactions).filter((tx) => tx.height < 1);
	},
);

/**
 * Returns the wallet store object.
 */
export const walletSelector = (state: Store): IWallet => state.wallet;

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

export const utxosSelector = createSelector(walletState, (wallet): IUtxo[] => {
	const selectedWallet = wallet.selectedWallet;
	const selectedNetwork = wallet.selectedNetwork;
	return wallet.wallets[selectedWallet]?.utxos[selectedNetwork] || [];
});

export const addressTypesSelector = createSelector(
	[walletState],
	(wallet): IAddressTypes => wallet.addressTypes,
);

export const walletExistsSelector = createSelector(
	[walletState],
	(wallet): boolean => wallet.walletExists,
);
