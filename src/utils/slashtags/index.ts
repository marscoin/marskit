import { navigate } from '../../navigation/root/RootNavigator';
import { SlashURL } from '@synonymdev/slashtags-sdk/dist/rn';
import type { SDK } from '@synonymdev/slashtags-sdk';
import {
	BasicProfile,
	IRemote,
	SlashPayConfig,
} from '../../store/types/slashtags';
import { Slashtag } from '../../hooks/slashtags';

/**
 * Handles pasting or scanning a slash:// url
 */
export const handleSlashtagURL = (
	url: string,
	onError: (error: Error) => void = (): void => {},
): void => {
	try {
		// Validate URL
		((): SlashURL => new SlashURL(url))();

		navigate('ContactEdit', { url });
	} catch (error) {
		onError(error as Error);
	}
};

/**
 * Extract the hostname part of a slashtag
 */
export const hostname = (url: string): string => new SlashURL(url).hostname;

/**
 * Returns the selected Slashtag from the sdk.
 * Currently we don't support multiple personas so it returns the root(default) slashtag.
 */
export const getSelectedSlashtag = (sdk: SDK): Slashtag => {
	return sdk.slashtag();
};

/**
 * Returns the latest version of a remote content.
 */
export const getRemote = async (slashtag: Slashtag): Promise<IRemote> => {
	const [remoteProfile, remoteSlashPay] = await Promise.all([
		slashtag.getProfile() as BasicProfile,
		slashtag.publicDrive
			.get('/slashpay.json')
			.then((buf) =>
				buf ? (JSON.parse(buf.toString()) as SlashPayConfig) : undefined,
			),
	]);
	return {
		profile: remoteProfile,
		payConfig: remoteSlashPay,
	};
};

/**
 * Saves a contact record in the contacts drive, and cache it in the store.
 */
// TODO(slashtags): should we add this to salshtag.setContact() ?
export const saveContact = async (
	slashtag: Slashtag,
	url: string,
	record: BasicProfile,
): Promise<void> => {
	const drive = await slashtag.drive({ name: 'contacts' });
	const id = hostname(url);
	return drive?.put('/' + id, Buffer.from(JSON.stringify(record)));
};

/**
 * Deletes a contact from the 'contacts' SlashDrive
 */
// TODO(slashtags): should we add a slasthag.deleteContact()?
export const deleteContact = async (sdk: SDK, url: string): Promise<any> => {
	const slashtag = getSelectedSlashtag(sdk);
	const drive = await slashtag?.drive({ name: 'contacts' });
	const id = hostname(url);
	return drive?.objects.del('/' + id);
};

/**
 * A helper function for saving many contacts at once for debugging purposes.
 * Generate a list using stpg's createBulkContacts and replace the urls array below.
 */
export const saveBulkContacts = async (slashtag: Slashtag): Promise<void> => {
	// Keep it empty on commit
	const urls: Array<string> = [];
	console.debug('Saving bulk contacts', { count: urls.length });

	const drive = await slashtag.drive({ name: 'contacts' });

	return Promise.all(
		urls.map(async (url) => {
			const name = Math.random().toString(16).slice(2, 8);
			const id = hostname(url);
			return drive?.put('/' + id, Buffer.from(JSON.stringify({ name })));
		}),
	).then(() => {
		console.debug('Done saving bulk contacts');
	});
};
