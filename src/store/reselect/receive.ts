import Store from '../types';
import { createSelector } from '@reduxjs/toolkit';
import { IReceive } from '../types/receive';

export const receiveState = (state: Store): IReceive => state.receive;

export const receiveSelector = createSelector(
	receiveState,
	(receive): IReceive => receive,
);
