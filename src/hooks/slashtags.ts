import { useEffect, useMemo, useState } from 'react';
import { SDK, SlashURL } from '@synonymdev/slashtags-sdk';
import c from 'compact-encoding';

import { useSlashtagsSDK } from '../components/SlashtagsProvider';
import { getSelectedSlashtag } from '../utils/slashtags';
import {
	BasicProfile,
	IRemote,
	SlashPayConfig,
} from '../store/types/slashtags';
import { useSlashtagsContacts } from '../components/SlashtagContactsProvider';

export type Slashtag = ReturnType<SDK['slashtag']>;

const usePublicDrive = (
	drive: ReturnType<SDK['drive']>,
): {
	resolved: boolean;
	remote: IRemote | undefined;
} => {
	const [resolved, setResolved] = useState<boolean>(false);
	const [profile, setProfile] = useState<BasicProfile | undefined>();
	const [payConfig, setPayconfig] = useState<SlashPayConfig | undefined>();

	const id = drive?.key && SlashURL.encode(drive.key);

	useEffect(() => {
		let unmounted = false;
		if (!drive || drive.closed) {
			return;
		}

		// Resolve once on opening the hook
		resolve();

		// Watch
		// TODO (slashtags) revisit after adding on('change', ({key})) to hyperdrive
		drive.core.on('append', resolve);

		async function resolve(): Promise<void> {
			await drive.ready();
			await Promise.all([
				drive
					.get('/profile.json')
					.then(
						(buf: Uint8Array) =>
							!unmounted && buf && setProfile(c.decode(c.json, buf)),
					),
				drive
					.get('/slashpay.json')
					.then(
						(buf: Uint8Array) =>
							!unmounted && buf && setPayconfig(c.decode(c.json, buf)),
					),
			]).finally(() => setResolved(true));
		}

		return function cleanup() {
			unmounted = true;
			drive.core.removeAllListeners();
		};
	}, [id]); // do NOT obey the linter!

	return {
		resolved,
		remote: {
			profile,
			payConfig,
		},
	};
};

/**
 * Returns reomte Profile, and slashPay config, and watch the publicDrive for updates.
 * Should only be used for remote slashtags until this issue is fixed: https://github.com/synonymdev/slashtags/issues/53
 */
export const useRemote = (
	url: string,
): {
	resolved: boolean;
	remote: IRemote | undefined;
} => {
	const sdk = useSlashtagsSDK();
	return usePublicDrive(sdk?.drive(SlashURL.parse(url).key));
};

/**
 * Same as useRemote but for the currently selected slashtag
 */
export const useSelectedSlashtag = (): {
	url?: string;
	slashtag?: Slashtag;
	resolved?: boolean;
} & IRemote => {
	const sdk = useSlashtagsSDK();
	const slashtag = useMemo(() => getSelectedSlashtag(sdk), [sdk]);
	const { resolved, remote } = usePublicDrive(slashtag?.drivestore.get());

	return { url: slashtag?.url, slashtag, ...remote, resolved };
};

/**
 * Combines the remote profile with the
 * saved contact record if exists.
 */
// export const useContact = (
// 	url: string,
// ): IRemote & { isContact: boolean; resolved: boolean } => {
// 	const { resolved, remote } = useRemote(url);
// 	// const { contacts } = useSlashtagsContacts();
// 	// const contactRecord = useMemo(() => {
// 	// return contacts[url];
// 	// }, [contacts, url]);
//
// 	const profile = useMemo(() => {
// 		return {
// 			...remote?.profile,
// 			// ...(contactRecord || {}),
// 		};
// 	}, [remote?.profile]);
//
// 	return {
// 		resolved,
// 		// Already saved in contacts drive
// 		// isContact: !!contactRecord,
// 		...remote,
// 		profile,
// 	};
// };
