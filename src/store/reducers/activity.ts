import actions from '../actions/actions';
import { IActivity } from '../types/activity';
import { defaultActivityShape } from '../shapes/activity';
import { filterActivityItems, mergeActivityItems } from '../../utils/activity';

const activity = (
	state: IActivity = { ...defaultActivityShape },
	action,
): IActivity => {
	switch (action.type) {
		case actions.UPDATE_ACTIVITY_ENTRIES:
			const items = mergeActivityItems(state.items, action.payload);
			return {
				...state,
				items,
				itemsFiltered: filterActivityItems(
					items,
					state.searchFilter,
					state.typesFilter,
				),
			};
		case actions.UPDATE_ACTIVITY_SEARCH_FILTER:
			const searchFilter = action.payload;
			return {
				...state,
				searchFilter,
				itemsFiltered: filterActivityItems(
					state.items,
					searchFilter,
					state.typesFilter,
				),
			};
		case actions.UPDATE_ACTIVITY_TYPES_FILTER:
			const typesFilter = action.payload;
			return {
				...state,
				typesFilter,
				itemsFiltered: filterActivityItems(
					state.items,
					state.searchFilter,
					typesFilter,
				),
			};
		case actions.RESET_ACTIVITY_STORE:
			return { ...defaultActivityShape };
		default:
			return state;
	}
};

export default activity;
