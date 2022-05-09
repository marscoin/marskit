import React, { useCallback, useContext, useEffect } from 'react';
import { useSelector } from 'react-redux';
import Store from '../store/types';
import { SlashtagsContext } from '@synonymdev/react-native-slashtags';
import {
	setApiReady,
	updateProfile,
	updateSdkState,
} from '../store/actions/slashtags';
import { getSlashtagsKeyPair } from '../utils/slashtags';
import { Alert } from 'react-native';
import { slashtagsNetworks } from '../utils/networks';

/**
 * Automatically sets and updates slashtags SDK with store data
 */
export function SlashtagsAutoSyncSDK(): JSX.Element {
	const slashtags = useContext(SlashtagsContext);

	const { profiles, apiReady } = useSelector((store: Store) => store.slashtags);

	const syncProfiles = useCallback(async () => {
		if (!slashtags.current) {
			return console.warn('Slashtags context not set');
		}

		try {
			const state = await slashtags.current.state();
			if (!state.sdkSetup) {
				return;
			}

			if (state.profiles === Object.keys(profiles).length) {
				return;
			}

			for (const i in Object.keys(profiles)) {
				const name = Object.keys(profiles)[i];
				const { basicProfile, slashtag } = profiles[name];

				const res = await slashtags.current.updateProfile({
					name,
					basicProfile,
				});

				if (!slashtag) {
					updateProfile(name, { basicProfile, slashtag: res.slashtag });
				}
			}

			const newState = await slashtags.current.state();
			updateSdkState(newState);
		} catch (e) {
			if (e.toString().toLowerCase().includes('api not ready')) {
				setApiReady(false);
			} else {
				console.error(e);
			}
		}
	}, [slashtags, profiles]);

	//Auto setup SDK and sync state when API is ready
	useEffect(() => {
		if (!apiReady) {
			return;
		}

		(async (): Promise<void> => {
			if (!slashtags.current) {
				return console.warn('Slashtags context not set');
			}

			try {
				const state = await slashtags.current.state();

				if (!state.sdkSetup) {
					let keyPairRes = await getSlashtagsKeyPair();
					if (keyPairRes.isErr()) {
						return Alert.alert(
							'Failed to get slashtags keypair',
							keyPairRes.error.message,
						);
					}

					if (!keyPairRes.value) {
						return Alert.alert(
							'Failed to get slashtags keypair',
							'Create a profile first',
						);
					}

					await slashtags.current.setupSDK({
						primaryKey: keyPairRes.value.secretKey,
						relays: slashtagsNetworks.localhost.relays,
					});
				}

				const newState = await slashtags.current.state();
				updateSdkState(newState);
				await syncProfiles();
			} catch (e) {
				if (e.toString().toLowerCase().includes('api not ready')) {
					setApiReady(false);
				} else {
					console.error(e);
				}
			}
		})();
	}, [slashtags, apiReady, syncProfiles]);

	//Keep web profiles in sync with store
	useEffect(() => {
		(async (): Promise<void> => {
			await syncProfiles();
		})();
	}, [slashtags, profiles, syncProfiles]);

	return <></>;
}
