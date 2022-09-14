import { useEffect, useMemo, useState } from 'react';
import { SDK } from '@synonymdev/slashtags-sdk';

import { useSlashtags, useSlashtagsSDK } from '../components/SlashtagsProvider';
import { IRemote } from '../store/types/slashtags';
import { getSelectedSlashtag, remotes } from '../utils/slashtags';

export type Slashtag = ReturnType<SDK['slashtag']>;

/**
 * Returns reomte Profile, and slashPay config, and watch the publicDrive for updates.
 */
export const useRemote = (
	url: string,
): {
	resolved: boolean;
	remote: IRemote | undefined;
} => {
	const [resolved, setResolved] = useState<boolean>(false);
	const [remote, setRemote] = useState<IRemote | undefined>(
		remotes.cache.get(url),
	);

	const sdk = useSlashtagsSDK();

	useEffect(() => {
		let unmounted = false;

		resolve();

		const drive = remotes.drive(sdk, url);
		drive.core.on('append', resolve);

		async function resolve() {
			const remote = await remotes.get(sdk, url);
			if (!unmounted) {
				setRemote(remote);
				setResolved(true);
			}
		}

		return function cleanup() {
			unmounted = true;
			drive.core.removeAllListeners();
			drive.close();
		};
	}, [sdk, url]);

	return {
		resolved,
		remote,
	};
};

/**
 * Returns the currently selected Slashtag
 */
export const useSelectedSlashtag = (): {
	url: string;
	slashtag: Slashtag;
} & IRemote => {
	const sdk = useSlashtagsSDK();
	const slashtag = getSelectedSlashtag(sdk);

	return { url: slashtag?.url, slashtag };
};

/**
 * Combines the remote profile with the
 * saved contact record if exists.
 */
export const useContact = (
	url: string,
): IRemote & { isContact: boolean; resolved: boolean } => {
	const { resolved, remote } = useRemote(url);
	const contacts = useSlashtags().contacts;
	const contactRecord = useMemo(() => contacts[url], [contacts, url]);

	const profile = useMemo(() => {
		return (
			(remote?.profile || contactRecord) && {
				...remote?.profile,
				...contactRecord,
			}
		);
	}, [remote?.profile]);

	return {
		resolved,
		// Already saved in contacts drive
		isContact: !!contactRecord,
		...remote,
		profile,
	};
};
