import actions from './actions';
import { getDispatch } from '../helpers';
import { SlashFeedJSON } from '../types/widgets';

const dispatch = getDispatch();

export const setAuthWidget = (
	url: string,
	data: {
		magiclink: boolean;
	},
): void => {
	dispatch({
		type: actions.SET_SLASHTAGS_AUTH_WIDGET,
		payload: {
			url,
			magiclink: data.magiclink,
		},
	});
};

export const setFeedWidget = (
	url: string,
	config: Partial<SlashFeedJSON>,
	selectedField: string,
): void => {
	dispatch({
		type: actions.SET_SLASHTAGS_FEED_WIDGET,
		payload: {
			url,
			feed: {
				selectedField,
				config,
			},
		},
	});
};

export const deleteFeedWidget = (url: string): void => {
	dispatch({
		type: actions.DELETE_SLASHTAGS_FEED_WIDGET,
		payload: { url },
	});
};

export const resetWidgetsStore = (): void => {
	dispatch({ type: actions.RESET_WIDGETS_STORE });
};
