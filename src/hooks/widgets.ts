import { SlashURL } from '@synonymdev/slashtags-sdk';
import { useEffect, useState } from 'react';

import { useSlashtagsSDK } from '../components/SlashtagsProvider';
import { closeDriveSession } from '../utils/slashtags';
import { showErrorNotification } from '../utils/notifications';
import { decodeWidgetFieldValue } from '../utils/widgets';
import { IWidget } from '../store/types/widgets';

export const useFeedWidget = ({
	url,
	feed,
}: {
	url: string;
	feed: IWidget['feed'];
}): {
	value?: any;
} => {
	const [value, setValue] = useState<string>();

	const sdk = useSlashtagsSDK();

	useEffect(() => {
		let unmounted = false;

		const parsed = SlashURL.parse(url);
		const key = parsed.key;
		const encryptionKey =
			typeof parsed.privateQuery.encryptionKey === 'string'
				? SlashURL.decode(parsed.privateQuery.encryptionKey)
				: undefined;

		const drive = sdk.drive(key, { encryptionKey });

		drive
			.ready()
			.then(read)
			.catch((e: Error) => {
				showErrorNotification({
					title: 'Failed to open feed drive',
					message: e.message,
				});
			});

		function read(): void {
			if (!feed?.field) {
				return;
			}
			drive
				.get(feed.field.main)
				.then((buf: Uint8Array) => decodeWidgetFieldValue(feed.type, buf))
				.then((_value: any) => !unmounted && _value && setValue(_value));
		}

		return function cleanup() {
			unmounted = true;
			closeDriveSession(drive);
		};
	}, [url, sdk, feed]);

	return {
		value,
	};
};
