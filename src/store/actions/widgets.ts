import actions from './actions';
import { getDispatch } from '../helpers';

const dispatch = getDispatch();

export const setAuthWidget = (
	url: string,
	data: {
		magiclink: boolean;
	},
): void => {
	dispatch({
		type: actions.SET_SLASHTAGS_AUTH_WIDGET,
		url,
		magiclink: data.magiclink,
	});
};

export const setFeedWidget = (
	url: string,
	feed: {
		selectedField?: string;
	},
): void => {
	dispatch({
		type: actions.SET_SLASHTAGS_FEED_WIDGET,
		url,
		feed,
	});
};

export const deleteFeedWidget = (url: string): void => {
	dispatch({
		type: actions.DELETE_SLASHTAGS_FEED_WIDGET,
		url,
	});
};

export const resetWidgetsStore = (): void => {
	dispatch({ type: actions.RESET_WIDGETS_STORE });
};
