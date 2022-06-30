import React, { ReactElement, useEffect, useState } from 'react';
// @ts-ignore
import { SDK } from '@synonymdev/slashtags-sdk/dist/rn.js';
import type { SDK as ISDK } from '@synonymdev/slashtags-sdk';
import { SlashtagsContext } from '../hooks/slashtags';

export interface ISlashtagsContext {
	sdk: ISDK;
	resolveProfile: (url: string) => Promise<object | null>;
	currentSlashtag: ReturnType<ISDK['slashtag']>;
}

export const SlashtagsProvider = ({
	primaryKey,
	onError,
	children,
}: {
	primaryKey: Buffer | null | Promise<Buffer | null>;
	onError: (error: Error) => void;
	children: ReactElement[];
}) => {
	const [state, setState] = useState<Partial<ISlashtagsContext>>({});

	useEffect(() => {
		(async () => {
			if (!primaryKey) {
				return;
			}
			if (state.sdk) {
				state.sdk.close();
			}

			try {
				const sdk: ISDK = await SDK.init({
					primaryKey: await primaryKey,
					persist: false,
					// TODO: replace hardcoded relays with configurable relays
					swarmOpts: { relays: ['ws://localhost:8888'] },
				});

				setState({
					sdk,
					resolveProfile(url) {
						console.log('resolving', !!sdk);
						const slashtag = sdk.slashtag({ url });
						return slashtag.getProfile();
					},
					currentSlashtag: sdk._root,
				});
			} catch (error) {
				onError(error as Error);
			}
		})();
	}, [primaryKey]);

	return (
		<SlashtagsContext.Provider value={state}>
			{children}
		</SlashtagsContext.Provider>
	);
};
