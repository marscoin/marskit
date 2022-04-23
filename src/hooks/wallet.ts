import { useSelector } from 'react-redux';
import Store from '../store/types';
import { IDisplayValues } from '../utils/exchange-rate/types';
import useDisplayValues from './displayValues';

export interface IncludeBalances {
	onchain?: boolean;
	lightning?: boolean;
	omnibolt?: string[];
}

/**
 * Retrieves the total wallet display values for the currently selected wallet and network.
 */
export function useBalance({
	onchain = false,
	lightning = false,
	omnibolt,
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
			//TODO: Iterate over each lightning channel and acquire the total balance.
		}

		if (omnibolt) {
			/*
				TODO: We'll need to implement a method that resolves the usd->sat value
				      of a given omni token before adding it to the balance.
		 */
			/*const channels = Object.keys(
				store.omnibolt.wallets[selectedWallet].channels[selectedNetwork],
			);
			omnibolt.map((id) => {
				if (id in channels) {
					balance += channels[id].balance_a;
				}
			});*/
		}

		return balance;
	});

	return useDisplayValues(b);
}
