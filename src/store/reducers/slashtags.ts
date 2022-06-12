import actions from '../actions/actions';
import { ISlashtags } from '../types/slashtags';
import { defaultSlashtagsShape } from '../shapes/slashtags';

const slashtags = (
	state: ISlashtags = defaultSlashtagsShape,
	action,
): ISlashtags => {
	switch (action.type) {
		case actions.SLASHTAGS_UPDATE_PROFILE:
			return {
				...state,
				profiles: {
					...state.profiles,
					[action.payload.name]: {
						...state.profiles[action.payload.name],
						...action.payload.profile,
					},
				},
			};
		case actions.SLASHTAGS_SET_ACTIVE_PROFILE: {
			return {
				...state,
				currentProfileName: action.payload.currentProfileName,
			};
		}
		case actions.RESET_SLASHTAGS_STORE:
			return { ...defaultSlashtagsShape };
		default:
			return state;
	}
};

export default slashtags;
