import { err, ok, Result } from '../result';
import { getLNURLParams } from './decoding';
import { getKeychainValue } from '../helpers';
import { createCallbackUrl, deriveLinkingKeys, signK1 } from './signing';
import { networks } from '../networks';
import { getStore } from '../../store/helpers';

/**
 * Authenticate with LNURL-AUTH
 * @param url
 * @returns {Promise<Err<unknown> | Ok<string>>}
 */
export const lnAuth = async (url: string): Promise<Result<string>> => {
	const lnurlRes = await getLNURLParams(url);
	if (lnurlRes.isErr()) {
		return err(lnurlRes.error);
	}

	const { data: walletSeed } = await getKeychainValue({ key: 'wallet0' });

	const keysRes = await deriveLinkingKeys(
		lnurlRes.value.domain,
		networks[getStore().wallet.selectedNetwork],
		walletSeed,
	);
	if (keysRes.isErr()) {
		return err(keysRes.error);
	}

	const signRes = await signK1(lnurlRes.value.k1, keysRes.value.privateKey);
	if (signRes.isErr()) {
		return err(signRes.error);
	}

	const callbackUrlRes = createCallbackUrl(
		lnurlRes.value.callback,
		signRes.value,
		keysRes.value.publicKey,
	);
	if (callbackUrlRes.isErr()) {
		return err(callbackUrlRes.error);
	}

	const fetchRes = await fetch(callbackUrlRes.value);

	const body: { status: string; reason: string } = await fetchRes.json();

	if (!body) {
		return err('Unknown HTTP error');
	}

	if ((body.status || '').toUpperCase() === 'OK') {
		return ok('Authenticated');
	} else if ((body.status || '').toUpperCase() === 'ERROR') {
		return err(body.reason);
	}

	return err(new Error('Unknown error'));
};

export const lnWithdraw = (url: string): Result<string> => {
	return ok('TODO withdraw');
};

export * from './signing';
export * from './decoding';
