import React, { ReactElement, useContext, useEffect, useMemo } from 'react';
import SDK from '@synonymdev/slashtags-sdk';
import { createContext } from 'react';
import RAWSFactory from 'random-access-web-storage';
import b4a from 'b4a';
// TODO (slashtags) update BackupProtocol for the new SDK version
// import BackupProtocol from 'backpack-client/src/backup-protocol.js';

import { storage as mmkv } from '../store/mmkv-storage';

export const RAWS = RAWSFactory({
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

const SlashtagsContext = createContext<SDK | undefined>(undefined);

export const SlashtagsProvider = ({
	primaryKey,
	relay,
	onError = noop,
	onReady = noop,
	children,
}: {
	relay: string;
	primaryKey?: Uint8Array;
	onError?: (error: Error) => void;
	onReady?: (sdk: SDK) => void;
	children: ReactElement[] | ReactElement;
}): JSX.Element => {
	const primaryKeyString = primaryKey && b4a.toString(primaryKey, 'hex');

	const sdk = useMemo(() => {
		if (!primaryKeyString) {
			return;
		}

		const _sdk = new SDK({
			primaryKey: primaryKeyString && b4a.from(primaryKeyString, 'hex'),
			// TODO(slashtags): replace it with non-blocking storage,
			// like random access react native after m1 support. or react-native-fs?
			storage: RAWS,
			relay,
		});
		_sdk
			.ready()
			.then(() => onReady(_sdk))
			.catch(onError);

		return _sdk;
	}, [primaryKeyString, relay, onError, onReady]);

	useEffect(() => {
		return function cleanup() {
			sdk?.close();
		};
	}, [sdk, primaryKeyString]);

	return (
		<SlashtagsContext.Provider value={sdk}>
			{children}
		</SlashtagsContext.Provider>
	);
};

export const useSlashtagsSDK = (): SDK | undefined =>
	useContext(SlashtagsContext);

function noop(): any {}
