import React, { useContext, useEffect, useMemo, useState } from 'react';
import SDK from '@synonymdev/slashtags-sdk';
import { createContext } from 'react';
import { useSelector } from 'react-redux';
import RAWSFactory from 'random-access-web-storage';
import b4a from 'b4a';
import c from 'compact-encoding';

import { storage as mmkv } from '../store/mmkv-storage';
import { BasicProfile, IContactRecord } from '../store/types/slashtags';
import { getSlashtagsPrimaryKey } from '../utils/wallet';
import { getSelectedSlashtag, onSDKError } from '../utils/slashtags';
import Store from '../store/types';
import { updateSeederMaybe } from '../store/actions/slashtags';

export const RAWS = RAWSFactory({
	setItem: (key: string, value: string) => {
		mmkv.set(key, value);
	},
	getItem: (key: string) => {
		return mmkv.getString(key);
	},
	removeItem: (key: string) => {
		mmkv.delete(key);
	},
});

export interface ISlashtagsContext {
	sdk: SDK;
	/** Cached local Slashtags profiles */
	profiles: { [url: string]: BasicProfile };
	contacts: { [url: string]: IContactRecord };
}

const SlashtagsContext = createContext<ISlashtagsContext>({
	sdk: {} as SDK,
	profiles: {},
	contacts: {},
});

/**
 * All things Slashtags that needs to happen on start of Bitkit
 * or stay available and cached through the App.
 */
export const SlashtagsProvider = ({ children }): JSX.Element => {
	const [primaryKey, setPrimaryKey] = useState<string>();
	const [opened, setOpened] = useState(false);
	const [profiles, setProfiles] = useState<ISlashtagsContext['profiles']>({});
	const [contacts, setContacts] = useState<ISlashtagsContext['contacts']>({});

	// Load primaryKey from keychain
	const seedHash = useSelector(
		(store: Store) =>
			store.wallet.wallets[store.wallet.selectedWallet]?.seedHash,
	);

	useEffect(() => {
		if (!seedHash) {
			return;
		}
		getSlashtagsPrimaryKey(seedHash).then(({ error, data }) => {
			if (error || (data && data.length === 0)) {
				onSDKError(
					new Error(
						'Could not load primaryKey from keyChain, data:"' + data + '"',
					),
				);
				return;
			}
			setPrimaryKey(data);
		});
	}, [seedHash]);

	const sdk = useMemo(() => {
		if (!primaryKey) {
			return;
		}
		return new SDK({
			// @ts-ignore
			primaryKey: primaryKey && b4a.from(primaryKey, 'hex'),
			// TODO(slashtags): replace it with non-blocking storage,
			// like random access react native after m1 support. or react-native-fs?
			storage: RAWS,
			// TODO(slashtags): add settings to customize this relay or use native
			relay: 'wss://dht-relay.synonym.to',
		});
	}, [primaryKey]);

	useEffect(() => {
		// Wait for primary key to be loaded from keyChain
		if (!sdk) {
			return;
		}

		let unmounted = false;

		// Setup local Slashtags
		(async (): Promise<void> => {
			await sdk.ready().catch(onSDKError);
			!unmounted && setOpened(true);

			// If corestore is closed for some reason, should not try to load drives
			if (sdk.closed) {
				return;
			}

			// Increase swarm sockets max event listeners
			sdk.swarm.on('connection', (socket: any) => socket.setMaxListeners(1000));

			const slashtag = getSelectedSlashtag(sdk);

			// Cache local profiles
			const publicDrive = slashtag.drivestore.get();
			publicDrive
				.ready()
				.then(() => {
					resolve();
					publicDrive.core.on('append', resolve);
				})
				.catch(onError);

			async function resolve(): Promise<void> {
				const profile = await publicDrive
					.get('/profile.json')
					.then((buf: Uint8Array) => buf && c.decode(c.json, buf))
					.catch(onError);
				!unmounted && setProfiles((p) => ({ ...p, [slashtag.url]: profile }));
			}

			// Send cores to seeder
			updateSeederMaybe(slashtag).catch(onError);

			// Update contacts

			// Load contacts from contacts drive on first loading of the app
			const contactsDrive = slashtag.drivestore.get('contacts');
			contactsDrive
				.ready()
				.then(() => {
					updateContacts();
					contactsDrive.core.on('append', updateContacts);
				})
				.catch(onError);

			function updateContacts(): void {
				const rs = contactsDrive.readdir('/');
				const promises: { [url: string]: Promise<IContactRecord> } = {};

				rs.on('data', (id: string) => {
					const url = 'slash:' + id;

					promises[id] = contactsDrive
						.get('/' + id)
						.then((buf: Uint8Array) => buf && { url, ...c.decode(c.json, buf) })
						.catch(onError);
				});
				rs.on('end', async () => {
					const resolved = await Promise.all(Object.values(promises));

					!unmounted &&
						setContacts(
							Object.fromEntries(
								resolved.map((contact) => [contact.url, contact]),
							),
						);
				});
			}
		})();

		return function cleanup() {
			unmounted = true;
			// sdk automatically gracefully close anyway!
		};
	}, [sdk]);

	return (
		// Do not render children (depending on the sdk) until the primary key is loaded and the sdk opened
		<SlashtagsContext.Provider value={{ sdk: sdk as SDK, profiles, contacts }}>
			{opened && children}
		</SlashtagsContext.Provider>
	);
};

export const useSlashtagsSDK = (): SDK => useContext(SlashtagsContext).sdk;

export const useSlashtags = (): ISlashtagsContext =>
	useContext(SlashtagsContext);

function onError(error: Error): void {
	console.debug(
		'Error in SlashtagsProvider while opening drive',
		error.message,
	);
}
