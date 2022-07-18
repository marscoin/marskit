import type { SDK as ISDK } from '@synonymdev/slashtags-sdk/types/src/index';
import type { EventsListeners } from '@synonymdev/slashdrive';
import { useEffect, useState } from 'react';
import { useSlashtags } from '../components/SlashtagsProvider';
import { BasicProfile } from '../store/types/slashtags';

export type Slashtag = ReturnType<ISDK['slashtag']>;

/**
 * Helper hook to get and set profiles.
 */
export const useSlashtagProfile = (opts?: {
	url: string;
}): [BasicProfile, (p: BasicProfile) => void] => {
	const [profile, setProfile] = useState<BasicProfile>({});

	const { sdk } = useSlashtags();
	const slashtag = sdk?.slashtag(opts);

	useEffect(() => {
		slashtag?.getProfile().then((p) => {
			setProfile({
				...(p || {}),
				id: slashtag.url.toString(),
			});
		});

		const listener: EventsListeners['update'] = async ({ key }) => {
			if (key === 'profile.json') {
				slashtag?.getProfile().then((p) => {
					setProfile({
						...(p || {}),
						id: slashtag.url.toString(),
					});
				});
			}
		};

		slashtag?.publicDrive?.on('update', listener);

		return (): void => {
			slashtag?.publicDrive?.removeListener('update', listener);
		};
	}, [slashtag]);

	return [
		profile,
		(toSave): void => {
			setProfile(toSave);
			slashtag?.setProfile(toSave);
		},
	];
};
