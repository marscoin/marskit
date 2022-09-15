import React, { useContext, useEffect, useMemo, useState } from 'react';
import SDK from '@synonymdev/slashtags-sdk';
import { createContext } from 'react';
import RAWSFactory from 'random-access-web-storage';
import b4a from 'b4a';
import c from 'compact-encoding';
import { useSelector } from 'react-redux';

// TODO (slashtags) update BackupProtocol for the new SDK version
// import BackupProtocol from 'backpack-client/src/backup-protocol.js';

import { storage as mmkv } from '../store/mmkv-storage';
import { BasicProfile, IContactRecord } from '../store/types/slashtags';
import { getSlashtagsPrimaryKey } from '../utils/wallet';
import { onSDKError, seedDrives } from '../utils/slashtags';
import Store from '../store/types';

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
	sdk: ((): SDK => {
		const sdk = new SDK({ relay: 'ws://foo:90' });
		sdk.ready().catch(noop);
		return sdk;
	})(),
	profiles: {},
	contacts: {},
});

/**
 * All things Slashtags that needs to happen on start of Bitkit
 * or stay available and cached through the App.
 */
export const SlashtagsProvider = ({ children }): JSX.Element => {
	const [primaryKey, setPrimaryKey] = useState<string>();
	const [profiles, setProfiles] = useState<ISlashtagsContext['profiles']>({});
	const [contacts, setContacts] = useState<ISlashtagsContext['contacts']>({});

	const selectedWallet = useSelector(
		(store: Store) => store.wallet.selectedWallet,
	);

	const seedHash = useSelector(
		(store: Store) => store.wallet.wallets[selectedWallet]?.seedHash,
	);

	useEffect(() => {
		seedHash &&
			getSlashtagsPrimaryKey(seedHash).then(({ error, data }) => {
				!error && setPrimaryKey(data);
			});
	}, [seedHash]);

	const sdk = useMemo(() => {
		return new SDK({
			primaryKey: primaryKey && b4a.from(primaryKey, 'hex'),
			// TODO(slashtags): replace it with non-blocking storage,
			// like random access react native after m1 support. or react-native-fs?
			storage: RAWS,
			// TODO(slashtags): add settings to customize this relay or use native
			relay: 'wss://dht-relay.synonym.to',
		});
	}, [primaryKey]);

	sdk.ready().catch(onSDKError);

	useEffect(() => {
		let unmounted = false;

		// Setup local Slashtags
		(async (): Promise<void> => {
			// Cache local profiles
			const slashtag = sdk.slashtag();
			const publicDrive = slashtag.drivestore.get();

			await publicDrive.ready();

			resolve();
			publicDrive.core.on('append', resolve);

			async function resolve(): Promise<void> {
				const profile = await publicDrive
					.get('/profile.json')
					.then((buf: Uint8Array) => buf && c.decode(c.json, buf));
				!unmounted && setProfiles((p) => ({ ...p, [slashtag.url]: profile }));
			}

			// Send cores to seeder
			seedDrives(slashtag);

			// Update contacts
			const contactsDrive = slashtag.drivestore.get('contacts');

			// Load contacts from contacts drive on first loading of the app
			contactsDrive.ready().then(updateContacts);
			contactsDrive.core.on('append', updateContacts);

			function updateContacts(): void {
				const rs = contactsDrive.readdir('/');
				const promises: { [url: string]: Promise<IContactRecord> } = {};

				rs.on('data', (id: string) => {
					const url = 'slash:' + id;

					promises[id] = contactsDrive
						.get('/' + id)
						.then(
							(buf: Uint8Array) => buf && { url, ...c.decode(c.json, buf) },
						);
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
		};
	}, [sdk]);

	return (
		<SlashtagsContext.Provider value={{ sdk, profiles, contacts }}>
			{children}
		</SlashtagsContext.Provider>
	);
};

export const useSlashtagsSDK = (): SDK => useContext(SlashtagsContext).sdk;

export const useSlashtags = (): ISlashtagsContext =>
	useContext(SlashtagsContext);

function noop(): any {}
