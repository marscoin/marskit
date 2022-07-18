import { SDK } from '@synonymdev/slashtags-sdk';

const profile = {
	name: 'Ar Nazeh',
	bio: '...',
	url: 'www.example.com',
	image:
		'https://pbs.twimg.com/profile_images/1500813628764823553/xBpOTdjg_400x400.jpg',
};

const sdk = await SDK.init({
	persist: false,
});

const slashtag = sdk.slashtag({ name: 'ward' });

await slashtag.setProfile(profile);

console.log("Mocking Ar's profile", {
	profile,
	slashtag: slashtag.url.toString(),
});

setInterval(async () => {
	const bio = Math.random().toString(16).slice(2);
	await slashtag.setProfile({
		...profile,
		bio,
	});
	console.log('Updated bio', bio);
}, 5000);
