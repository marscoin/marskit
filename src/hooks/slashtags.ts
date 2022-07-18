import type { SDK as ISDK } from '@synonymdev/slashtags-sdk/types/src/index';
import { useEffect, useState } from 'react';
import { useSlashtags } from '../components/SlashtagsProvider';
import { BasicProfile } from '../store/types/slashtags';

export type Slashtag = ReturnType<ISDK['slashtag']>;

/**
 * Helper hook to return Slashtag's profile
 * and detect when it has a new version to fetch.
 */
export const useSlashtagProfile = (opts?: {
	url: string;
}): [BasicProfile, (profile: BasicProfile) => void] => {
	const [profile, setProfile] = useState<BasicProfile>({ id: opts?.url });

	const { sdk } = useSlashtags();

	const slashtag =
		// TODO update the SDK to handle this on its own
		opts?.url === sdk?._root.url.toString() ? sdk?._root : sdk?.slashtag(opts);

	const saveProfile = (profileToSave: BasicProfile): void => {
		slashtag?.setProfile(profileToSave);
		setProfile(profile);
	};

	useEffect((): (() => void) => {
		// set a clean up flag
		let shouldSetProfile = true;

		(async (): Promise<void> => {
			const p = await slashtag?.getProfile();

			if (shouldSetProfile) {
				setProfile({
					...(p || {}),
					id: slashtag?.url.toString(),
				});
			}
		})();

		return () => {
			shouldSetProfile = false;
		};
	}, [
		slashtag,
		// TODO: add drive.version API to SlashDrive
		// slashtag?.publicDrive?.objects.version,
	]);

	return [profile, saveProfile];
};
