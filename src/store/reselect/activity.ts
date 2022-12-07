import Store from '../types';
import { createSelector } from '@reduxjs/toolkit';
import { IActivityItem } from '../types/activity';
import { defaultActivityItemShape } from '../shapes/activity';

const activityItemsState = (state: Store): IActivityItem[] =>
	state.activity.items;

export const activityItemsSelector = createSelector(
	activityItemsState,
	(activityItems): IActivityItem[] => activityItems,
);

export const activityItemSelector = createSelector(
	[
		activityItemsState,
		(activityItems, activityId?: string): string => activityId ?? '',
	],
	(activityItems, activityId): IActivityItem | undefined => {
		return activityItems.find(
			(item) => item?.id === activityId ?? defaultActivityItemShape,
		);
	},
);
