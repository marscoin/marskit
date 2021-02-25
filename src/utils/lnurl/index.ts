import { err, ok, Result } from '../result';
import { createWithdrawCallbackUrl } from './decoding';
import { getKeychainValue } from '../helpers';
import { deriveLinkingKeys, signK1 } from './signing';
import { createAuthCallbackUrl } from './decoding';
import { networks } from '../networks';
import { getStore } from '../../store/helpers';
import { LNURLAuthParams, LNURLWithdrawParams } from 'js-lnurl';

const call = async (url: string): Promise<Result<string>> => {
	const fetchRes = await fetch(url);

	const body: { status: string; reason: string } = await fetchRes.json();

	if (!body) {
		return err('Unknown HTTP error');
	}

	if ((body.status || '').toUpperCase() === 'OK') {
		return ok('Authenticated');
	} else if ((body.status || '').toUpperCase() === 'ERROR') {
		return err(body.reason);
	}

	return err('Unknown error');
};

/**
 * Authenticate with LNURL-AUTH
 * @param url
 * @returns {Promise<Err<unknown> | Ok<string>>}
 */
export const lnAuth = async (
	params: LNURLAuthParams,
): Promise<Result<string>> => {
	const { data: walletSeed } = await getKeychainValue({ key: 'wallet0' });

	const keysRes = await deriveLinkingKeys(
		params.domain,
		networks[getStore().wallet.selectedNetwork],
		walletSeed,
	);
	if (keysRes.isErr()) {
		return err(keysRes.error);
	}

	const signRes = await signK1(params.k1, keysRes.value.privateKey);
	if (signRes.isErr()) {
		return err(signRes.error);
	}

	const callbackUrlRes = createAuthCallbackUrl(
		params.callback,
		signRes.value,
		keysRes.value.publicKey,
	);
	if (callbackUrlRes.isErr()) {
		return err(callbackUrlRes.error);
	}

	return call(callbackUrlRes.value);
};

/**
 * Calls LNURL-WITHDRAW callback with newly created invoice.
 * Url needs to be decoded first so invoice can be created with correct amounts.
 * @param url
 * @param invoice
 */
export const lnWithdraw = async (
	params: LNURLWithdrawParams,
	paymentRequest: string,
): Promise<Result<string>> => {
	const callbackUrlRes = createWithdrawCallbackUrl(
		params.callback,
		params.k1,
		paymentRequest,
	);
	if (callbackUrlRes.isErr()) {
		return err(callbackUrlRes.error);
	}

	return call(callbackUrlRes.value);
};

export * from './signing';
export * from './decoding';
