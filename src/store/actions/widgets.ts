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

export const resetWidgetsStore = (): void => {
	dispatch({ type: actions.RESET_WIDGETS_STORE });
};
