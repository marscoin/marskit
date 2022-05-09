import { ISlashtags } from '../types/slashtags';

export const defaultSlashtagsShape: ISlashtags = {
	apiReady: false,
	sdkState: {
		sdkSetup: false,
		profiles: 0,
		relays: [],
	},
	profiles: {},
	currentProfileName: '',
};
