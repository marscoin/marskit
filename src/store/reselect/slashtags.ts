import Store from '../types';
import { createSelector } from '@reduxjs/toolkit';
import { LocalLink, TOnboardingProfileStep } from '../types/slashtags';

const onboardingProfileStepState = (state: Store): TOnboardingProfileStep =>
	state.slashtags.onboardingProfileStep;
const slashtagsLinksState = (state: Store): LocalLink[] =>
	state.slashtags.links;
const lastSentState = (state: Store): number | undefined =>
	state.slashtags.seeder?.lastSent;

export const lastSentSelector = createSelector(
	lastSentState,
	(lastSent): number | undefined => lastSent,
);
export const onboardingProfileStepSelector = createSelector(
	onboardingProfileStepState,
	(onboardingProfileStep): TOnboardingProfileStep => onboardingProfileStep,
);

export const slashtagsLinksSelector = createSelector(
	slashtagsLinksState,
	(links): LocalLink[] => links,
);
