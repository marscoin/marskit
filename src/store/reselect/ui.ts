import Store from '../types';
import { createSelector } from '@reduxjs/toolkit';
import { TProfileLink } from '../types/ui';

const profileLinkState = (state: Store): TProfileLink => state.ui.profileLink;

export const profileLinkSelector = createSelector(
	profileLinkState,
	(profileLink): TProfileLink => profileLink,
);
