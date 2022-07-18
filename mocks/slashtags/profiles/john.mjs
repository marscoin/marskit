import { SDK } from '@synonymdev/slashtags-sdk';

const profile = {
	name: 'John Carvalho',
	bio: 'CEO at @synonym_to // Host of @thebizbtc ☣️',
	url: 'https://t.co/hmLlTE0Rbv',
	image:
		'https://pbs.twimg.com/profile_images/1447755054719643649/SCJJteiL_400x400.jpg',
};

const sdk = await SDK.init({
	primaryKey: Buffer.from('a'.repeat(64)),
	persist: false,
});

const slashtag = sdk.slashtag({ name: 'john' });

await slashtag.setProfile(profile);

console.log("Mocking John's profile", {
	profile,
	slashtag: slashtag.url.toString(),
});
