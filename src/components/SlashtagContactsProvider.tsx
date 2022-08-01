import React, { useContext, useEffect, useState } from 'react';
import { createContext } from 'react';
import { IContactRecord } from '../store/types/slashtags';
import { useSelectedSlashtag } from '../hooks/slashtags';
import { SlashDrive } from '@synonymdev/slashdrive';
import { useSlashtagsSDK } from './SlashtagsProvider';

export interface ISlashtagContactsContext {
	contacts: {
		[url: string]: IContactRecord;
	};
}

const SlashtagContactsContext = createContext<ISlashtagContactsContext>({
	contacts: {},
});

export const SlashtagsContactsProvider = ({ children }): JSX.Element => {
	const sdk = useSlashtagsSDK();
	const { slashtag } = useSelectedSlashtag();
	const [state, setState] = useState<ISlashtagContactsContext>({
		contacts: {},
	});

	useEffect(() => {
		let unmounted = false;
		let _drive = slashtag.drive({ name: 'contacts' });

		_drive.then(onLoad);
		_drive.then((drive) => drive.on('update', onUpdate));

		// Load contacts from contacts drive on first loading of the app
		function onLoad(drive: SlashDrive): void {
			const rs = drive.objects.createReadStream();
			const _contacts: ISlashtagContactsContext['contacts'] = {};

			rs.on('data', async (data) => {
				const url = 'slash:/' + data.key.toString();
				const metadata = drive.decode(data.value);
				const object = await drive.content.get(metadata.blobIndex);
				let contact = { url, name: '' };
				try {
					contact = {
						...contact,
						...JSON.parse(object.toString()),
					};
				} catch (error) {}

				_contacts[url] = contact;
			});
			rs.on('end', () => {
				!unmounted && setState((s) => ({ ...s, contacts: _contacts }));
			});
		}

		// Rehydrate the contacts map when
		// a contact is saved or deleted
		async function onUpdate(entry): Promise<void> {
			const id = entry.key.toString();
			if (entry.type === 'del') {
				return del(id);
			} else {
				return set(id);
			}
		}

		/**
		 * Update contact
		 */
		async function set(id: string): Promise<void> {
			const url = 'slash:/' + id;
			const drive = await _drive;
			const record = await drive
				.get(id)
				.then((c) => c && JSON.parse(c.toString()));

			!unmounted &&
				setState((s) => {
					return {
						...s,
						contacts: {
							...s.contacts,
							[url]: { ...s.contacts[url], ...record, url },
						},
					};
				});
		}

		/**
		 * Remove contact from the list
		 */
		function del(id: string): void {
			const url = 'slash:/' + id;
			!unmounted &&
				setState((s) => {
					return {
						...s,
						contacts: Object.fromEntries(
							Object.entries(s.contacts).filter(([k]) => {
								return k !== url;
							}),
						),
					};
				});
		}

		return () => {
			unmounted = true;
			_drive.then((drive) => drive.removeListener('update', onUpdate));
		};
	}, [slashtag, sdk]);

	return (
		<SlashtagContactsContext.Provider value={state}>
			{children}
		</SlashtagContactsContext.Provider>
	);
};

/**
 * Source of truth about saved contact records.
 * Most helpful for contacts list that needs all
 * the records to order them by name!
 * For the latest remote profile and payconfig
 * updates use useContact(url) or useRemote(url).
 */
export const useSlashtagsContacts = (): ISlashtagContactsContext =>
	useContext(SlashtagContactsContext);
