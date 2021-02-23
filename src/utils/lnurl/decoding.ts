import { getParams, LNURLAuthParams, LNURLWithdrawParams } from 'js-lnurl';
import { err, ok, Result } from '../result';

/**
 * Parses LNURL
 * @param url
 * @returns {Promise<Ok<LNURLWithdrawParams> | Err<unknown> | Ok<LNURLAuthParams>>}
 */
export const getLNURLParams = async (
	url: string,
): Promise<Result<LNURLAuthParams>> => {
	try {
		const params = await getParams(url);

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
export const createCallbackUrl = (
	callback: string,
	signature: string,
	linkingPublicKey: string,
): Result<string> => {
	return ok(`${callback}&sig=${signature}&key=${linkingPublicKey}`);
};
