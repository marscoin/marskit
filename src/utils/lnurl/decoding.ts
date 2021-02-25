import { getParams, LNURLAuthParams, LNURLWithdrawParams } from 'js-lnurl';
import { err, ok, Result } from '../result';

/**
 * Parses LNURL
 * @param url
 * @returns {Promise<Ok<LNURLWithdrawParams> | Err<unknown> | Ok<LNURLAuthParams>>}
 */
export const getLNURLParams = async (
	url: string,
): Promise<Result<LNURLAuthParams | LNURLWithdrawParams>> => {
	try {
		const params = await getParams(url);

		const status = 'status' in params ? params.status : '';
		if (status === 'ERROR') {
			const reason = 'reason' in params ? params.reason : '';
			if (reason) {
				return err(reason);
			}

			return err('Unknown error parsing LNURL params');
		}

		const tag = 'tag' in params ? params.tag : '';

		switch (tag) {
			case 'withdrawRequest': {
				return ok(params as LNURLWithdrawParams);
			}

			case 'login': {
				return ok(params as LNURLAuthParams);
			}
		}

		return err(`${tag} not yet implemented`);
	} catch (e) {
		return err(e);
	}
};

/**
 * Creates a authorization callback URL
 * @param callback
 * @param signature
 * @param linkingPublicKey
 * @returns {Ok<string>}
 */
export const createAuthCallbackUrl = (
	callback: string,
	signature: string,
	linkingPublicKey: string,
): Result<string> => {
	return ok(`${callback}&sig=${signature}&key=${linkingPublicKey}`);
};

/**
 * Creates a withdraw callback URL
 * @param callback
 * @param k1
 * @param invoice
 * @returns {Ok<string>}
 */
export const createWithdrawCallbackUrl = (
	callback: string,
	k1: string,
	invoice: string,
): Result<string> => {
	return ok(
		`${callback}${callback.endsWith('?') ? '' : '?'}&k1=${k1}&pr=${invoice}`,
	);
};
