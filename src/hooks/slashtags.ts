import type { SDK as ISDK } from '@synonymdev/slashtags-sdk/types/src/index';
import type { EventsListeners } from '@synonymdev/slashdrive';
import { useEffect, useState } from 'react';
import { useSlashtagsSDK } from '../components/SlashtagsProvider';
import { BasicProfile, SlashPayConfig } from '../store/types/slashtags';

export type Slashtag = ReturnType<ISDK['slashtag']>;

/**
 * Helper hook to get and set profiles.
 */
export const useSlashtag = (opts?: {
	url: string;
}): {
	slashtag?: Slashtag;
	profile: BasicProfile;
	setProfile: (p: BasicProfile) => void;
	payConfig;
	setPayConfig: (p: SlashPayConfig) => void;
} => {
	const [profile, setProfile] = useState<BasicProfile>({});
	const [payConfig, setPayConfig] = useState<SlashPayConfig>({});

	const { sdk } = useSlashtagsSDK();
	const slashtag = sdk?.slashtag(opts);

	useEffect(() => {
		let shouldUpdate = true;

		slashtag?.getProfile().then((p) => {
			shouldUpdate && p && setProfile(p);
		});

		const listener: EventsListeners['update'] = async ({ key }) => {
			if (key === 'profile.json') {
				slashtag?.getProfile().then((p) => {
					shouldUpdate && p && setProfile(p);
				});
			} else if (key === 'slashpay.json') {
				slashtag?.publicDrive
					?.get('slashpay.json')
					.then((config) => {
						shouldUpdate &&
							config &&
							setPayConfig(JSON.parse(config.toString()));
					})
					.catch((error) => {
						console.debug('error reading slashpay.json', { error });
					});
			}
		};

		slashtag?.publicDrive?.on('update', listener);

		return (): void => {
			shouldUpdate = false;
			slashtag?.publicDrive?.removeListener('update', listener);
		};
	}, [slashtag]);

	return {
		slashtag,
		profile,
		setProfile: (toSave): void => {
			slashtag?.setProfile(toSave);
		},
		payConfig,
		setPayConfig: (toSave): void => {
			slashtag?.publicDrive?.put(
				'slashpay.json',
				Buffer.from(JSON.stringify(toSave)),
			);
		},
	};
};
