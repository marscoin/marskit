import React, { ReactElement, useEffect } from 'react';
import lm from '@synonymdev/react-native-ldk';
import { performRemoteLdkBackup } from '../../store/actions/backup';
import { useSelectedSlashtag } from '../../hooks/slashtags';
import { DISABLE_SLASHTAGS } from '@env';

const EnabledSlashtag = (): ReactElement => {
	const { slashtag } = useSelectedSlashtag();

	//TODO perform other backup types

	useEffect(() => {
		const sub = lm.subscribeToBackups((res) => {
			performRemoteLdkBackup(
				slashtag,
				res.isOk() ? res.value : undefined,
			).catch(console.error);
		});

		return () => lm.unsubscribeFromBackups(sub);
	}, [slashtag]);

	return <></>;
};

const BackupSubscriber = (): ReactElement => {
	return !DISABLE_SLASHTAGS ? <EnabledSlashtag /> : <></>;
};

export default BackupSubscriber;
