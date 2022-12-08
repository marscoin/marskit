import Store from '../types';
import { createSelector } from '@reduxjs/toolkit';
import { IReceive } from '../types/receive';

const entireState = (state: Store): Store => state;

export const receiveSelector = createSelector(
	[entireState],
	(state): IReceive => state.receive,
);
