import actions from '../actions/actions';
import { IActivity, IActivityItem } from '../types/activity';
import { defaultActivityShape } from '../shapes/activity';
import { mergeActivityItems } from '../../utils/activity';

const activity = (state: IActivity, action): IActivity => {
	switch (action.type) {
		case actions.UPDATE_ACTIVITY_ENTRIES:
			const oldItems = state.items;
			const newItems: IActivityItem[] = action.payload;

			return {
				...state,
				items: mergeActivityItems(oldItems, newItems),
			};
		default:
			return {
				...defaultActivityShape,
				...state,
			};
	}
};

export default activity;
