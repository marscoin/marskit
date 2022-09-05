import { useSelector } from 'react-redux';
import Store from '../store/types';
import {
	defaultBitcoinTransactionData,
	IAddressContent,
	IBitcoinTransactionData,
} from '../store/types/wallet';
import { reduceValue } from '../utils/helpers';
import { EFeeIds } from '../store/types/fees';

/**
 * Current transaction object of the selectedWallet/Network.
 */
export function useTransactionDetails(): IBitcoinTransactionData {
	const selectedWallet = useSelector(
		(store: Store) => store.wallet.selectedWallet,
	);
	const selectedNetwork = useSelector(
		(store: Store) => store.wallet.selectedNetwork,
	);

	const transaction = useSelector(
		(store: Store) =>
			store.wallet.wallets[selectedWallet]?.transaction[selectedNetwork] ||
			defaultBitcoinTransactionData,
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

	const transaction = useSelector(
		(store: Store) =>
			store.wallet.wallets[selectedWallet]?.transaction[selectedNetwork],
	);

	const balance = reduceValue({
		arr: transaction?.inputs ?? [],
		value: 'value',
	});
	if (balance.isOk()) {
		return balance.value;
	}

	return 0;
}

export function useChangeAddress(): IAddressContent {
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

/**
 * Returns the selected fee id from the fee picker for the current transaction.
 */
export function useSelectedFeeId(): EFeeIds {
	const selectedWallet = useSelector(
		(store: Store) => store.wallet.selectedWallet,
	);
	const selectedNetwork = useSelector(
		(store: Store) => store.wallet.selectedNetwork,
	);
	return useSelector(
		(store: Store) =>
			store?.wallet?.wallets[selectedWallet]?.transaction[selectedNetwork]
				?.selectedFeeId ?? EFeeIds.none,
	);
}
