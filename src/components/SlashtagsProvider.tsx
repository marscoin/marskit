import React, { ReactElement, useEffect, useState } from 'react';
// @ts-ignore
import { SDK } from '@synonymdev/slashtags-sdk/dist/rn.js';
import type { SDK as ISDK } from '@synonymdev/slashtags-sdk/types/src/index';
import { SlashtagsContext } from '../hooks/slashtags';
import { storage as mmkv } from '../store/mmkv-storage';
import RAWSFactory from 'random-access-web-storage';
import { BasicProfile } from '../store/types/slashtags';

const RAWS = RAWSFactory({
	setItem: (key, value) => {
		mmkv.set(key, value);
	},
	getItem: (key) => {
		return mmkv.getString(key);
	},
	removeItem: (key) => {
		mmkv.delete(key);
	},
});

export const clearSlashtagsStorage = (): void => {
	const keys = mmkv.getAllKeys();
	for (let key of keys) {
		key.startsWith('core') && mmkv.delete(key);
	}
};

export type Slashtag = ReturnType<ISDK['slashtag']>;
export interface ISlashtagsContext {
	sdk: ISDK;
	slashtag: Slashtag;
	profile: BasicProfile;
}

export const SlashtagsProvider = ({
	primaryKey,
	onError,
	children,
}: {
	primaryKey: Buffer | null | Promise<Buffer | null>;
	onError: (error: Error) => void;
	children: ReactElement[];
}): JSX.Element => {
	const [state, setState] = useState<Partial<ISlashtagsContext>>({});

	useEffect(() => {
		(async (): Promise<undefined | (() => void)> => {
			if (!primaryKey) {
				return;
			}

			try {
				const sdk = await (SDK as typeof ISDK).init({
					primaryKey: (await primaryKey) as Uint8Array,
					// TODO: replace it with random access react native after m1 support
					storage: RAWS,
					// TODO: replace hardcoded relays with configurable relays
					swarmOpts: { relays: ['ws://localhost:45475'] },
				});

				const slashtag = sdk.slashtag();

				setState({ sdk, slashtag, profile: await profile() });

				// Watch public drive updates
				slashtag?.publicDrive?.on('update', onUpdate);

				return () => {
					slashtag?.removeListener('update', onUpdate);
					sdk?.close();
				};

				async function onUpdate({ key }: { key: string }): Promise<void> {
					if (key === 'profile.json') {
						setState({ sdk, slashtag, profile: await profile() });
					}
				}

				async function profile(): Promise<BasicProfile> {
					return {
						id: slashtag.url.toString(),
						...((await slashtag.getProfile()) as BasicProfile),
					};
				}
			} catch (error) {
				onError(error as Error);
			}
		})();
	}, [primaryKey, onError]);

	return (
		<SlashtagsContext.Provider value={state}>
			{children}
		</SlashtagsContext.Provider>
	);
};
