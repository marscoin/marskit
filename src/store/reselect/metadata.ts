import Store from '../types';
import { createSelector } from '@reduxjs/toolkit';
import { TLastUsedTags, TTags } from '../types/metadata';

const tagsState = (state: Store): TTags => state.metadata.tags;
const lastUsedTagsState = (state: Store): TLastUsedTags =>
	state.metadata.lastUsedTags;

export const tagsSelector = createSelector(tagsState, (tags): TTags => tags);
export const lastUsedTagsSelector = createSelector(
	lastUsedTagsState,
	(lastUsedTags): TLastUsedTags => lastUsedTags,
);
