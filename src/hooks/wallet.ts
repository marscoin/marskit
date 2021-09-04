import { useSelector } from 'react-redux';
import Store from '../store/types';
import { IDisplayValues } from '../utils/exchange-rate';
import useDisplayValues from './displayValues';

interface IncludeBalances {
	onchain?: boolean;
	lightning?: boolean;
	omnibolt?: boolean;
}

/**
 * Retrieves the total wallet display values for the currently selected wallet and network.
 */
export function useBalance({
	onchain = false,
	lightning = false,
	omnibolt = false,
}: IncludeBalances): IDisplayValues {
	const selectedWallet = useSelector(
		(store: Store) => store.wallet.selectedWallet,
	);
	const selectedNetwork = useSelector(
		(store: Store) => store.wallet.selectedNetwork,
	);

	const b = useSelector((store: Store) => {
		let balance = 0;

		if (onchain) {
			balance +=
				store.wallet?.wallets[selectedWallet]?.balance[selectedNetwork] ?? 0;
		}

		if (lightning) {
			balance +=
				Number(store.lightning.channelBalance.balance) +
				Number(store.lightning.channelBalance.pendingOpenBalance);
		}

		if (omnibolt) {
			//TODO
		}

		return balance;
	});

	return useDisplayValues(b);
}
