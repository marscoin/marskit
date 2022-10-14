import React, { ReactElement, useEffect } from 'react';
import lm from '@synonymdev/react-native-ldk';
import { performRemoteLdkBackup } from '../../store/actions/backup';
import { useSelectedSlashtag } from '../../hooks/slashtags';
import { useSelector } from 'react-redux';
import Store from '../../store/types';

const BackupSubscriber = (): ReactElement => {
	const { slashtag } = useSelectedSlashtag();
	const backupsEnabled = useSelector(
		(state: Store) => state.backup.remoteBackupsEnabled,
	);

	//TODO perform other backup types

	useEffect(() => {
		if (!backupsEnabled) {
			return;
		}
		const sub = lm.subscribeToBackups((res) => {
			performRemoteLdkBackup(
				slashtag,
				res.isOk() ? res.value : undefined,
			).catch(console.error);
		});

		return () => lm.unsubscribeFromBackups(sub);
	}, [slashtag, backupsEnabled]);

	return <></>;
};

export default BackupSubscriber;
