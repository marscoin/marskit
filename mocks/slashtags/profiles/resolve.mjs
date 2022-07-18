import { SDK } from '@synonymdev/slashtags-sdk';
import { argv } from 'process';

const sdk = await SDK.init({
	persist: false,
	swarmOpts: {
		relays: ['ws://167.86.102.121:45475'],
	},
});

const slashtag = sdk.slashtag({ url: argv[2] });

console.time('Resolved');
const profile = await slashtag.getProfile();

console.log("Resolved Bitkit's profile", {
	profile,
	slashtag: slashtag.url.toString(),
});
console.timeEnd('Resolved');

sdk.close();
