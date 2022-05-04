import { ISlashtags } from '../types/slashtags';

export const defaultSlashtagsShape: ISlashtags = {
	sdkState: {
		sdkSetup: false,
		profiles: 0,
		relays: '', //TODO becomes array in next version
	},
	profiles: {},
	currentProfileName: '',
};
