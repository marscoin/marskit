const walletsEN = require('./en/wallets.json');
const profileEN = require('./en/profile.json');
const activityEN = require('./en/activity.json');
const menuEN = require('./en/menu.json');
const commonEN = require('./en/common.json');

export default {
	en: {
		//One namespace per screen with a common for shared words
		wallets: walletsEN,
		profile: profileEN,
		activity: activityEN,
		menu: menuEN,
		common: commonEN,
	},
};
