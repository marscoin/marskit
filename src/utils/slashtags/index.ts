import { SDK, SlashURL, Slashtag } from '@synonymdev/slashtags-sdk';
import c from 'compact-encoding';

import { navigate } from '../../navigation/root/RootNavigator';
import { BasicProfile, SlashPayConfig } from '../../store/types/slashtags';
import { showErrorNotification } from '../notifications';
import { getReceiveAddress } from '../../utils/wallet';
import { createLightningInvoice } from '../../utils/lightning';
import { getStore } from '../../store/helpers';

/**
 * Handles pasting or scanning a slash:// url
 */
export const handleSlashtagURL = (
	url: string,
	onError: (error: Error) => void = (): void => {},
): void => {
	try {
		// Validate URL
		SlashURL.parse(url);

		navigate('ContactEdit', { url });
	} catch (error) {
		onError(error as Error);
	}
};

/**
 * Returns the selected Slashtag.
 * Currently we don't support multiple personas so it returns the root(default) slashtag.
 */
export const getSelectedSlashtag = (
	sdk: SDK | undefined,
): Slashtag | undefined => {
	return sdk?.slashtag();
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
	const drive = await slashtag.drivestore.get('contacts');
	const id = SlashURL.parse(url).id;
	return drive?.put('/' + id, Buffer.from(JSON.stringify(record)));
};

/**
 * Deletes a contact from the 'contacts' SlashDrive
 */
// TODO(slashtags): should we add a slasthag.deleteContact()?
export const deleteContact = async (sdk: SDK, url: string): Promise<any> => {
	const slashtag = getSelectedSlashtag(sdk);
	if (!slashtag) {
		return;
	}
	const drive = await slashtag.drivestore.get('contacts');
	const id = SlashURL.parse(url).id;
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

	const drive = await slashtag.drivestore.get('contacts');

	return Promise.all(
		urls.map(async (url) => {
			const name = Math.random().toString(16).slice(2, 8);
			const id = SlashURL.parse(url).id;
			return drive?.put('/' + id, Buffer.from(JSON.stringify({ name })));
		}),
	).then(() => {
		console.debug('Done saving bulk contacts');
	});
};

/**
 * Bookkeeping once the Primary Key is passed to the Slashtags Provider, and the SDK is created.
 *
 * 1- Set the sdk global value.
 */
export const onSDKReady = async (sdk: SDK): Promise<void> => {
	console.debug(!!sdk && 'SDK is ready');
};

export const onSDKError = (error: Error): void => {
	// TODO (slashtags) move this error management to the SDK
	if (error.message.endsWith('Connection refused')) {
		error = new Error("Couldn't connect to the provided DHT relay");
	}

	showErrorNotification({
		title: 'SlashtagsProvider Error',
		message: error.message,
	});
};

export const updateSlashPayConfig = async (
	sdk: SDK | undefined,
	options: {
		/** Offline payments */
		p2wpkh?: boolean;
		expiryDeltaSeconds?: number;
		lightningInvoiceDescription?: string;
		lightningInvoiceSats?: number;
	},
): Promise<{
	payConfig: SlashPayConfig;
}> => {
	const slashtag = getSelectedSlashtag(sdk);
	if (!slashtag) {
		return;
	}
	const publicDrive = slashtag.drivestore.get();

	const payConfig: SlashPayConfig = [];

	{
		// LN invoice first to prefer it over onchain, if possible.
		const response = await createLightningInvoice({
			amountSats: options.lightningInvoiceSats || 0,
			description: options?.lightningInvoiceDescription || '',
			expiryDeltaSeconds: options.expiryDeltaSeconds || 60 * 60 * 24 * 7, //Should be rather high (Days or Weeks).
		});

		if (response.isOk()) {
			payConfig.push({
				type: 'lightningInvoice',
				value: response.value.to_str,
			});
		}
	}

	if (options.p2wpkh) {
		const selectedWallet = getStore().wallet.selectedWallet;
		const response = getReceiveAddress({ selectedWallet });
		if (response.isOk()) {
			payConfig.push({ type: 'p2wpkh', value: response.value });
		}
	}

	await publicDrive.put('/slashpay.json', c.encode(c.json, payConfig));
	console.debug('Updated slashpay.json:', payConfig);

	return {
		/** Saved config */
		payConfig,
	};
};
