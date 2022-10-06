import { SlashURL } from '@synonymdev/slashtags-sdk';
import { useEffect, useState } from 'react';
import b4a from 'b4a';

import { useSlashtagsSDK } from '../components/SlashtagsProvider';
import { SlashFeedJSON } from '../store/types/widgets';
import { closeDriveSession, decodeJSON } from '../utils/slashtags';
import { showErrorNotification } from '../utils/notifications';

export const useFeedWidget = ({
	url,
	selectedField,
}: {
	url: string;
	selectedField?: string;
}): {
	value?: string;
	config?: SlashFeedJSON;
} => {
	const [config, setConfig] = useState<SlashFeedJSON>();
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
			.then(open)
			.catch((e: Error) => {
				showErrorNotification({
					title: 'Failed to open feed drive',
					message: e.message,
				});
			});

		function open(): void {
			drive
				.get('/slashfeed.json')
				.then(decodeJSON)
				.then((c: SlashFeedJSON) => !unmounted && setConfig(c))
				.then(() => {
					read();
					drive.core.on('append', read);
				})
				.catch((e: Error) => {
					showErrorNotification({
						title: 'Could not resolve feed configuration file slashfeed.json',
						message: e.message,
					});
				});
		}

		function read(): void {
			if (!selectedField) {
				return;
			}
			const path = '/feed/' + selectedField;
			drive.get(path).then((buf: Uint8Array) => {
				const _value = b4a.toString(buf);
				!unmounted && buf && setValue(_value);
			});
		}

		return function cleanup() {
			unmounted = true;
			closeDriveSession(drive);
		};
	}, [url, sdk, selectedField]);

	return {
		config,
		value,
	};
};
