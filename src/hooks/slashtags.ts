import { useEffect, useMemo, useState } from 'react';
import type { SDK } from '@synonymdev/slashtags-sdk';

import { useSlashtagsSDK } from '../components/SlashtagsProvider';
import { getSelectedSlashtag, getRemote } from '../utils/slashtags';
import { IRemote } from '../store/types/slashtags';
import { useSlashtagsContacts } from '../components/SlashtagContactsProvider';

export type Slashtag = ReturnType<SDK['slashtag']>;

/**
 * Returns reomte Profile, and slashPay config, and watch the publicDrive for updates.
 */
export const useRemote = (
	url: string,
): {
	// Set to true once resolving the profile is done
	resolved: boolean;
	remote: IRemote | undefined;
} => {
	const sdk = useSlashtagsSDK();
	const [remote, setRemote] = useState<IRemote>();

	useEffect(() => {
		let unmounted = false;
		const slashtag = sdk.slashtag({ url });

		// Get the profile once on opening the hook.
		resolve();

		// Watch for any edits or updates to hot reload the profil.
		const onUpdate = (): Promise<void> => resolve();
		slashtag.publicDrive.on('update', onUpdate);

		async function resolve(): Promise<void> {
			const _remote = await getRemote(slashtag);
			!unmounted && setRemote(_remote);
		}

		// Clean everything
		return () => {
			unmounted = true;
			slashtag.publicDrive.removeListener('update', onUpdate);
		};
	}, [sdk, url]);

	return {
		resolved: !!remote?.profile,
		remote,
	};
};

/**
 * Same as useRemote but for the currently selected slashtag
 */
export const useSelectedSlashtag = (): {
	url: string;
	slashtag: Slashtag;
} & IRemote => {
	const sdk = useSlashtagsSDK();
	const slashtag = useMemo(() => getSelectedSlashtag(sdk), [sdk]);
	const { remote } = useRemote(slashtag.url.origin);

	return { url: slashtag.url.origin, slashtag, ...remote };
};

/**
 * Combines the remote profile with the
 * saved contact record if exists.
 */
export const useContact = (
	url: string,
): IRemote & { isContact: boolean; resolved: boolean } => {
	const { resolved, remote } = useRemote(url);
	const { contacts } = useSlashtagsContacts();
	const contactRecord = useMemo(() => {
		return contacts[url];
	}, [contacts, url]);

	const profile = useMemo(() => {
		return {
			...remote?.profile,
			...(contactRecord || {}),
		};
	}, [remote?.profile, contactRecord]);

	return {
		resolved,
		// Already saved in contacts drive
		isContact: !!contactRecord,
		...remote,
		profile,
	};
};
