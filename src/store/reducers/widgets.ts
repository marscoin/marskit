import actions from '../actions/actions';
import { defaultWidgetsShape } from '../shapes/widgets';
import { IWidgets } from '../types/widgets';

const slashtags = (state: IWidgets = defaultWidgetsShape, action): IWidgets => {
	const existing = state.widgets[action.url] || {};

	switch (action.type) {
		case actions.RESET_WIDGETS_STORE:
			return defaultWidgetsShape;

		case actions.SET_SLASHTAGS_AUTH_WIDGET:
			return {
				...state,
				widgets: {
					...state.widgets,
					[action.url]: {
						...existing,
						magiclink: action.magiclink,
					},
				},
			};

		case actions.SET_SLASHTAGS_FEED_WIDGET:
			return {
				...state,
				widgets: {
					...state.widgets,
					[action.url]: {
						...existing,
						feed: {
							...existing.feed,
							...action.feed,
						},
					},
				},
			};

		case actions.DELETE_SLASHTAGS_FEED_WIDGET:
			const widgets = { ...state.widgets };
			delete widgets[action.url];

			return { ...state, widgets };

		default:
			return state;
	}
};

export default slashtags;
