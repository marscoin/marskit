import Store from '../types';
import { createSelector } from '@reduxjs/toolkit';
import { IWidget } from '../types/widgets';

const widgetsState = (state: Store): { [url: string]: IWidget } =>
	state.widgets.widgets;

/**
 * Returns all widgets.
 */
export const widgetsSelector = createSelector(
	widgetsState,
	(widgets): { [url: string]: IWidget } => widgets,
);

/**
 * Return specified widget by url.
 */
export const widgetSelector = createSelector(
	[widgetsState, (widgets, url: string): string => url],
	(widgets, url): IWidget => widgets[url],
);
