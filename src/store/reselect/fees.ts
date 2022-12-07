import Store from '../types';
import { createSelector } from '@reduxjs/toolkit';
import { IOnchainFees } from '../types/fees';

const onChainFeesState = (state: Store): IOnchainFees => state.fees.onchain;

export const onChainFeesSelector = createSelector(
	onChainFeesState,
	(onChainFees): IOnchainFees => onChainFees,
);
