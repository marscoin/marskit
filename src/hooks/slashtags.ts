import { useEffect, useState } from 'react';
import { SDK, SlashURL } from '@synonymdev/slashtags-sdk';
import c from 'compact-encoding';

import { useSlashtags, useSlashtagsSDK } from '../components/SlashtagsProvider';
import { BasicProfile, IRemote } from '../store/types/slashtags';
import { getSelectedSlashtag } from '../utils/slashtags';

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

		drive.ready().then(resolve);
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
		};
	}, [url, sdk]);

	return {
		resolving,
		profile,
	};
};
