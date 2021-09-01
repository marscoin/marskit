import { useSelector } from 'react-redux';
import Store from '../../../store/types';

/**
 * Retrieves the total wallet balance for the currently selected wallet and network.
 */
export function useBalance(): number {
	const selectedWallet = useSelector(
		(store: Store) => store.wallet.selectedWallet,
	);
	const selectedNetwork = useSelector(
		(store: Store) => store.wallet.selectedNetwork,
	);

	return useSelector(
		(store: Store) =>
			store.wallet?.wallets[selectedWallet]?.balance[selectedNetwork] ?? 0,
	);
}
