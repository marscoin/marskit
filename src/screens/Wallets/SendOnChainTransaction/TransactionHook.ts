import { useSelector } from 'react-redux';
import Store from '../../../store/types';
import {
	defaultOnChainTransactionData,
	IOnChainTransactionData,
} from '../../../store/types/wallet';
import { reduceValue } from '../../../utils/helpers';

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
