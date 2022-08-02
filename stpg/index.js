/* eslint-disable @typescript-eslint/explicit-function-return-type */
import inquirer from 'inquirer';
import { SDK } from '@synonymdev/slashtags-sdk';
import fs from 'fs';
import path from 'path';
import falso from '@ngneat/falso';
import fetch from 'node-fetch';

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

/** @type {[url: string]: string} */
const contacts = {};

while (!closed) {
	try {
		const { action } = await inquirer.prompt([
			{
				type: 'list',
				name: 'action',
				message: 'What do you like to do?',
				choices: [
					'Resolve profile',
					'Create contact',
					'Create bulk contacts',
					...(Object.keys(contacts).length > 0 ? ['Update contact'] : []),
					'close',
				],
			},
		]);

		switch (action) {
			case 'Resolve profile':
				await resolveProfile();
				break;
			case 'Create contact':
				await createContact();
				break;
			case 'Update contact':
				await updateContact();
				break;
			case 'Create bulk contacts':
				await createBulkContacts();
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

	const profile = await slashtag.getProfile();
	console.log('resolved profile');

	const slashpay = await slashtag.publicDrive
		.get('/slashpay.json')
		.then((buf) => JSON.parse(buf.toString()))
		.catch(noop);
	console.timeEnd('-- resolved drive in');

	console.dir(
		{
			url: slashtag.url.origin,
			version: slashtag.publicDrive.version,
			profile: formatProfile(profile),
			slashpay,
		},
		{ depth: null },
	);
}

/**
 * Creates a contact and returns its url
 * @param {boolean} log
 * @returns {string}
 */
async function createContact(log = true) {
	const name = Math.random().toString(16).slice(2);
	const slashtag = sdk.slashtag({ name });
	const contact = await generateContact(slashtag.url.origin);
	saveContact(slashtag, contact);
	contacts[contact.url] = name;

	log && console.dir(formatContact(contact), { depth: null });
	return contact.url;
}

async function createBulkContacts() {
	const { count } = await inquirer.prompt([
		{
			type: 'input',
			name: 'count',
			message: 'How many contacts to create?',
			default: 10,
		},
	]);

	const urls = await Promise.all(
		new Array(Number(count)).fill(0).map(() => createContact(false)),
	);

	console.log('Created', count, 'contacts');
	console.log(urls);
}

async function updateContact() {
	const { selected } = await inquirer.prompt([
		{
			type: 'list',
			name: 'selected',
			message: 'Choose selected contact to update:',
			choices: Object.keys(contacts),
		},
	]);

	const nameUsedForCreatingSlasthag = contacts[selected];
	const slashtag = sdk.slashtag({ name: nameUsedForCreatingSlasthag });
	const newContact = await generateContact(selected);
	await saveContact(slashtag, newContact);
	console.dir(formatContact(newContact), { depth: null });
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
	try {
		const str = fs.readFileSync(cacheLocation);
		return JSON.parse(str.toString());
	} catch (error) {
		return {};
	}
}

function noop() {}

function formatProfile(profile) {
	return (
		profile && {
			...profile,
			...(profile.image ? { image: profile.image.slice(0, 40) + '...' } : {}),
		}
	);
}

function formatContact(contact) {
	return {
		...contact,
		profile: formatProfile(contact.profile),
	};
}

async function saveContact(slashtag, contact) {
	await slashtag.setProfile(contact.profile);
	await slashtag.publicDrive.put(
		'/slashpay.json',
		Buffer.from(JSON.stringify(contact.slashpay)),
	);

	return formatContact(contact);
}

async function generateContact(url) {
	const name = falso.randFullName();
	const imageURL = falso.randAvatar();
	const response = await fetch(imageURL);
	const body = await response.buffer();

	return {
		url,
		profile: {
			name,
			image:
				'data:' +
				response.headers['content-type'] +
				';base64,' +
				Buffer.from(body).toString('base64'),
			bio: falso.randPhrase().slice(0, 160),
			links: [
				{
					title: 'twitter',
					url: 'https://www.twitter.com/' + falso.randWord(),
				},
				{ title: 'website', url: falso.randUrl() },
			],
		},
		slashpay: {
			p2wpkh: falso.randBitcoinAddress(),
		},
	};
}
