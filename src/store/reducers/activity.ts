import actions from '../actions/actions';
import { IActivity, IActivityItem } from '../types/activity';
import { defaultActivityShape } from '../shapes/activity';

const activity = (state: IActivity, action): IActivity => {
	switch (action.type) {
		case actions.UPDATE_ACTIVITY_ENTRIES:
			//Append any new items or update existing ones
			const oldItems = state.items;
			const newItems: IActivityItem[] = action.payload;

			oldItems.forEach((oldItem, index) => {
				const updatedItemIndex = newItems.findIndex(
					(newItem) =>
						newItem.type === oldItem.type && newItem.id === oldItem.id,
				);

				//Found an updated item so replace it
				if (updatedItemIndex > -1) {
					oldItems[index] = newItems[updatedItemIndex];
					newItems.splice(updatedItemIndex, 1);
				}
			});

			return {
				...state,
				items: [...oldItems, ...newItems].sort(
					(a, b) => b.timestampUtc - a.timestampUtc,
				),
			};
		default:
			return {
				...defaultActivityShape,
				...state,
			};
	}
};

export default activity;
