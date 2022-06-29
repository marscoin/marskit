import React, { ReactElement, useEffect, useState } from 'react';
// @ts-ignore
import { SDK } from '@synonymdev/slashtags-sdk/dist/rn.js';
import type { SDK as ISDK } from '@synonymdev/slashtags-sdk/types/src/index';
import { SlashtagsContext } from '../hooks/slashtags';
import { storage as mmkv } from '../store/mmkv-storage';
import RAWSFactory from 'random-access-web-storage';

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

export interface ISlashtagsContext {
	sdk: ISDK;
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
			if (!primaryKey) return;
			if (state.sdk) state.sdk.close();

			try {
				const sdk = await (SDK as typeof ISDK).init({
					primaryKey: (await primaryKey) as Uint8Array,
					// TODO: replace it with random access react native after m1 support
					storage: RAWS,
					// TODO: replace hardcoded relays with configurable relays
					swarmOpts: { relays: ['ws://localhost:8888'] },
				});

				setState({ sdk });
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
