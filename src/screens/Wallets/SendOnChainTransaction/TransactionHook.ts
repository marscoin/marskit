import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import Store from '../../../store/types';
import {
	defaultOnChainTransactionData,
	IOnChainTransactionData,
} from '../../../store/types/wallet';

/**
 * Current transaction object of the selectedWallet/Network.
 */
export function useTransactionDetails(): IOnChainTransactionData {
	const selectedWallet = useSelector(
		(store: Store) => store.wallet.selectedWallet,
	);
	const selectedNetwork = useSelector(
		(store: Store) => store.wallet.selectedNetwork,
	);

	const transaction = useSelector(
		(store: Store) =>
			store.wallet.wallets[selectedWallet]?.transaction[selectedNetwork] ||
			defaultOnChainTransactionData,
	);

	return transaction;
}

export function useBalance(): number {
	const selectedWallet = useSelector(
		(store: Store) => store.wallet.selectedWallet,
	);
	const selectedNetwork = useSelector(
		(store: Store) => store.wallet.selectedNetwork,
	);

	const balance = useSelector(
		(store: Store) =>
			store.wallet.wallets[selectedWallet]?.balance[selectedNetwork],
	);

	return balance;
}

export function useChangeAddress(): string {
	const selectedWallet = useSelector(
		(store: Store) => store.wallet.selectedWallet,
	);
	const selectedNetwork = useSelector(
		(store: Store) => store.wallet.selectedNetwork,
	);

	const changeAddress = useSelector(
		(store: Store) =>
			store.wallet.wallets[selectedWallet]?.changeAddressIndex[selectedNetwork]
				?.address || ' ',
	);

	return changeAddress;
}
