import actions from '../actions/actions';
import { defaultSlashtagsShape } from '../shapes/slashtags';
import { ISlashtags } from '../types/slashtags';

const slashtags = (state = defaultSlashtagsShape, action): ISlashtags => {
	switch (action.type) {
		case actions.RESET_SLASHTAGS_STORE:
			return defaultSlashtagsShape;
		case actions.SET_VISITED_PROFILE:
			return {
				...state,
				visitedProfile: action.visitedProfile,
			};
		case actions.SET_VISITED_CONTACTS:
			return {
				...state,
				visitedContacts: action.visitedContacts,
			};
		case actions.SET_PROFILE_SEEN:
			return {
				...state,
				profiles: {
					...(state.profiles || {}),
					[action.id]: {
						...(state.profiles[action.id] || {}),
						seen: action.version,
					},
				},
			};
		default:
			return state;
	}
};

export default slashtags;
