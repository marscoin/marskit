import {
	createCallbackUrl,
	deriveLinkingKeys,
	signK1,
} from '../src/utils/lnurl';
// import { createWallet } from '../src/store/actions/wallet';

describe('LN URL', () => {
	beforeAll(async () => {
		// await createWallet({});
	});

	it('derives linking keys and signs k1', async () => {
		const lnurlParams = {
			tag: 'login',
			k1: '287921948779c297cce0435b60d5c40e3d009c9fd569c44ed2bb7f75710c4730',
			callback:
				'https://api.testnet.lnmarkets.com/lnurl/a?tag=login&k1=287921948779c297cce0435b60d5c40e3d009c9fd569c44ed2bb7f75710c4730&hmac=380917c1d5d549df923d209e9ec9313b2ebb545a82a80ba2fd40c3b020186e04',
			domain: 'api.testnet.lnmarkets.com',
		};

		const seed = 'test test test';
		const passphrase = 'test123';

		const keysRes = await deriveLinkingKeys(
			seed,
			passphrase,
			lnurlParams.domain,
		);

		expect(keysRes.isOk()).toEqual(true);
		if (keysRes.isErr()) {
			return;
		}

		if (keysRes.isOk()) {
			expect(keysRes.value.privateKey).toEqual(
				'3a645464c66ffcf9ee86d43dd09cdd5b1ef0c20b97a5abbc1f2ab634aa9a6ebe',
			);
			expect(keysRes.value.publicKey).toEqual(
				'0346665d944ad6b3710366c558668ffe843f70cd1f6c220fa3256323ef09d6b22d',
			);
		}

		const signRes = await signK1(lnurlParams.k1, keysRes.value.privateKey);
		expect(signRes.isOk()).toEqual(true);
		if (signRes.isOk()) {
			expect(signRes.value).toEqual(
				'304502210098df4ebc8effbae859673a656f68db571a256f4b8f2c051c73ca072d889ad947022005a1c10650da766798f437c0381ed4efd0bf1e3bb26be1ba4688a16eb4d15109',
			);
		}
		if (signRes.isErr()) {
			return;
		}

		const callbackUrlRes = createCallbackUrl(
			lnurlParams.callback,
			signRes.value,
			keysRes.value.publicKey,
		);
		expect(callbackUrlRes.isOk()).toEqual(true);
		if (callbackUrlRes.isOk()) {
			expect(callbackUrlRes.value).toEqual(
				'https://api.testnet.lnmarkets.com/lnurl/a?tag=login&k1=287921948779c297cce0435b60d5c40e3d009c9fd569c44ed2bb7f75710c4730&hmac=380917c1d5d549df923d209e9ec9313b2ebb545a82a80ba2fd40c3b020186e04&sig=304502210098df4ebc8effbae859673a656f68db571a256f4b8f2c051c73ca072d889ad947022005a1c10650da766798f437c0381ed4efd0bf1e3bb26be1ba4688a16eb4d15109&key=0346665d944ad6b3710366c558668ffe843f70cd1f6c220fa3256323ef09d6b22d',
			);
		}
	});
});
