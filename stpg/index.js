/* eslint-disable */
import inquirer from 'inquirer';
import { SDK } from '@synonymdev/slashtags-sdk';
import fs from 'fs';
import path from 'path';

const cacheLocation = path.join(
	import.meta.url.replace('file:/', ''),
	'..',
	'cache.json',
);

const sdk = await SDK.init({
	persist: false,
});

let cached = loadCache();

let closed = false;

while (!closed) {
	try {
		const { action } = await inquirer.prompt([
			{
				type: 'list',
				name: 'action',
				message: 'What do you like to do?',
				choices: ['Resolve profile', 'close'],
			},
		]);

		switch (action) {
			case 'Resolve profile':
				await resolveProfile();
				break;
			case 'close':
				console.log('Closing...');
				await sdk.close();
				closed = true;
				break;
			default:
				await resolveProfile();
				break;
		}
	} catch (error) {
		console.log('Got error:', error.message);
	}
}

async function resolveProfile() {
	const { url } = await inquirer.prompt([
		{
			type: 'input',
			name: 'url',
			message: "Enter slasthag's url",
			default: cached.lastUsedURL,
		},
	]);

	if (!url || url.length === 0) {
		throw new Error('Expected a Slasthag url');
	}
	cache({ lastUsedURL: url });

	const slashtag = sdk.slashtag({ url });
	console.log('Resolving public drive ...');
	console.time('-- resolved drive in');
	await slashtag.ready();
	await slashtag.publicDrive?.getContent();
	console.timeEnd('-- resolved drive in');

	const profile = await slashtag.getProfile();

	const slashpay = await slashtag.publicDrive
		.get('slashpay.json')
		.then((buf) => JSON.parse(buf.toString()))
		.catch(noop);

	console.dir(
		{
			url: slashtag.url.toString(),
			version: slashtag.publicDrive.objects.version,
			profile: profile && {
				...profile,
				...(profile.image ? { image: profile.image.slice(0, 40) + '...' } : {}),
			},
			slashpay,
		},
		{ depth: null },
	);
}

/**
 *
 * @param {object} toCache
 */
function cache(toCache) {
	cached = { ...cached, ...toCache };
	fs.writeFile(cacheLocation, JSON.stringify(cached), noop);
}

function loadCache() {
	const str = fs.readFileSync(cacheLocation);
	return JSON.parse(str.toString());
}

function noop() {}
