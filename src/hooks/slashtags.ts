import { useEffect, useState } from 'react';
import { SDK, SlashURL } from '@synonymdev/slashtags-sdk';
import c from 'compact-encoding';

import { useSlashtags, useSlashtagsSDK } from '../components/SlashtagsProvider';
import { BasicProfile, IRemote } from '../store/types/slashtags';
import { gcdrive, getSelectedSlashtag } from '../utils/slashtags';

export type Slashtag = ReturnType<SDK['slashtag']>;

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
 * Watchs the public profile of a local or remote slashtag by its url.
 */
export const useProfile = (
	url: string,
): { resolving: boolean; profile: BasicProfile } => {
	// TODO (slashtags) remove this caching if it is too costly
	const cached = useSlashtags().profiles[url];
	const [profile, setProfile] = useState<BasicProfile>(cached || {});
	const [resolving, setResolving] = useState(true);

	const sdk = useSlashtagsSDK();

	useEffect(() => {
		let unmounted = false;
		const drive = sdk.drive(SlashURL.parse(url).key);

		drive
			.ready()
			.then(resolve)
			.catch((error: Error) => {
				console.debug('Error on opening public hyperdrive in useProfile', {
					error: error.message,
					url,
				});
			});
		drive.core.on('append', resolve);

		async function resolve(): Promise<void> {
			const _profile = await drive
				.get('/profile.json')
				.then((buf: Uint8Array) => buf && c.decode(c.json, buf));

			set(_profile);
		}

		function set(_profile: BasicProfile): void {
			!unmounted && setResolving(false);
			!unmounted && setProfile(_profile);
		}

		return function cleanup(): void {
			unmounted = true;
			drive.core.removeAllListeners();
			gcdrive(drive);

			// Uncomment following code to watch number of close listeners on replication streams
			// TODO (slashtags): fix close events on the same stream
			// While this should be fixed, it grows to max of twice the number of contacts
			// console.debug({closeListeners: [...sdk.swarm._allConnections._byPublicKey.values()].map((s) => s.listenerCount('close'))})
		};
	}, [url, sdk]);

	return {
		resolving,
		profile,
	};
};
