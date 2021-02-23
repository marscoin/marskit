import { getParams, LNURLAuthParams } from 'js-lnurl';
import { err, ok, Result } from '../result';

const lnAuth = async (
	callback: string,
	signature: string,
	linkingKey: string,
): Promise<Result<string>> => {
	return ok('TODO');
};

export const getLNURLParams = async (url: string): Promise<Result<string>> => {
	try {
		const params = await getParams(url);

		const tag = 'tag' in params ? params.tag : '';

		switch (tag) {
			case 'withdrawRequest': {
				// tag: string
				// k1: string
				// callback: string
				// domain: string
				// minWithdrawable: number
				// maxWithdrawable: number
				// defaultDescription: string
				break;
			}

			case 'login': {
				// domain: string // callback: string // k1: string // tag: string
				const p = params as LNURLAuthParams;

				return ok(JSON.stringify(p));

				// return authRes;
			}
		}

		return err(`${tag} not yet implemented`);
	} catch (e) {
		return err(e);
	}
};
