import { useSelector } from 'react-redux';
import {
	IAddressContent,
	IBitcoinTransactionData,
} from '../store/types/wallet';
import { reduceValue } from '../utils/helpers';
import { EFeeIds } from '../store/types/fees';
import {
	changeAddressSelector,
	selectedFeeIdSelector,
	transactionSelector,
} from '../store/reselect/wallet';
import { useMemo } from 'react';

/**
 * Current transaction object of the selectedWallet/Network.
 */
export function useTransactionDetails(): IBitcoinTransactionData {
	return useSelector(transactionSelector);
}

export function useBalance(): number {
	const transaction = useSelector(transactionSelector);
	const balance = useMemo(
		() =>
			reduceValue({
				arr: transaction?.inputs ?? [],
				value: 'value',
			}),
		[transaction?.inputs],
	);
	if (balance.isOk()) {
		return balance.value;
	}

	return 0;
}

export function useChangeAddress(): IAddressContent {
	return useSelector(changeAddressSelector);
}

/**
 * Returns the selected fee id from the fee picker for the current transaction.
 */
export function useSelectedFeeId(): EFeeIds {
	return useSelector(selectedFeeIdSelector);
}
