import actions from '../actions/actions';
import { defaultWidgetsShape } from '../shapes/widgets';
import { IWidgets } from '../types/widgets';

const slashtags = (state: IWidgets = defaultWidgetsShape, action): IWidgets => {
	switch (action.type) {
		case actions.RESET_WIDGETS_STORE:
			return defaultWidgetsShape;
		case actions.SET_SLASHTAGS_AUTH_WIDGET:
			const existing = state.widgets[action.url] || {};

			return {
				widgets: {
					...state.widgets,
					[action.url]: {
						...existing,
						magiclink: action.magiclink,
					},
				},
			};
		default:
			return state;
	}
};

export default slashtags;
