import { useSelector } from 'react-redux';
import Store from '../../../store/types';
import { IDisplayValues } from '../../../utils/exchange-rate';
import useDisplayValues from '../../../utils/exchange-rate/useDisplayValues';

interface IncludeBalances {
	onchain?: boolean;
	lightning?: boolean;
	omnibolt?: boolean;
}

/**
 * Retrieves the total wallet balance for the currently selected wallet and network.
 * Includes all wallets by default.
 */
export function useBalance(
	{ onchain = true, lightning = true, omnibolt = true }: IncludeBalances = {
		omnibolt: true,
		lightning: true,
		onchain: true,
	},
): IDisplayValues {
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
