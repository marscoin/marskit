import {
	createCallbackUrl,
	deriveLinkingKeys,
	getLNURLParams,
	signK1,
} from '../src/utils/lnurl';
import { createWallet } from '../src/store/actions/wallet';
import { getKeychainValue } from '../src/utils/helpers';
import { networks } from "../src/utils/networks";

const lnurl =
	'lnurl1dp68gurn8ghj7ctsdyh8getnw3hx2apwd3hx6ctjddjhguewvdhk6tmvde6hymp0vylhgct884kx7emfdcnxkvfa8yunje3cxqunjdpcxg6nyvenvdjxxcfex56nwvfjxgckxdfhvgunzvtzxesn2ef5xv6rgc348ycnsvpjv43nxcfnxd3kgcfsvymnsdpxdpkkzceav5crzce38yekvcejxumxgvrrxqmkzc3svycnwdp5xgunxc33vvekxwf3vv6nvwf3xqux2vrrvfsnydryxvurgcfsxcmrjdp4v5cr2dgx0xng4';

describe('LN URL', () => {
	beforeAll(async () => {
		await createWallet({
			mnemonic:
				'stable inch effort skull suggest circle charge lemon amazing clean giant quantum party grow visa best rule icon gown disagree win drop smile love',
		});
	});

	it('Decodes LNURL-auth, derives linking keys, signs k1 and created callback URL', async () => {
		const lnurlRes = await getLNURLParams(lnurl);

		expect(lnurlRes.isOk()).toEqual(true);
		if (lnurlRes.isErr()) {
			return;
		}

		const { data: walletSeed } = await getKeychainValue({ key: 'wallet0' });

		const keysRes = await deriveLinkingKeys(lnurlRes.value.domain, networks.bitcoinTestnet, walletSeed);

		expect(keysRes.isOk()).toEqual(true);
		if (keysRes.isErr()) {
			return;
		}

		if (keysRes.isOk()) {
			expect(keysRes.value.privateKey).toEqual(
				'9bbadf4820256e649f8f7ece7e2e65f5fa865a4c08b5b1d896ddd05440e916a1',
			);
			expect(keysRes.value.publicKey).toEqual(
				'0388b8c9d0480679cec949a15a8a53f68a16d10827de5da669a8685faf68e5ebe5',
			);
		}

		const signRes = await signK1(lnurlRes.value.k1, keysRes.value.privateKey);
		expect(signRes.isOk()).toEqual(true);
		if (signRes.isOk()) {
			expect(signRes.value).toEqual(
				'3045022100fb9ab319ebabc2bbaec403544cc47ea6287613fc374be3612c2dde6b34c1e31b022013ec1b14efe24d64bdab77858b19efa5112e6ea6108de96f2c901dd13fc6afaa',
			);
		}
		if (signRes.isErr()) {
			return;
		}

		const callbackUrlRes = createCallbackUrl(
			lnurlRes.value.callback,
			signRes.value,
			keysRes.value.publicKey,
		);
		expect(callbackUrlRes.isOk()).toEqual(true);
		if (callbackUrlRes.isOk()) {
			expect(callbackUrlRes.value).toEqual(
				'https://api.testnet.lnmarkets.com/lnurl/a?tag=login&k1=999f80994825233cdca95571221c57b911b6a5e4344b591802ec3a33cda0a784&hmac=e01c193fc276d0c07ab0a1744293b1c3c91c569108e0cba24d384a066945e055&sig=3045022100fb9ab319ebabc2bbaec403544cc47ea6287613fc374be3612c2dde6b34c1e31b022013ec1b14efe24d64bdab77858b19efa5112e6ea6108de96f2c901dd13fc6afaa&key=0388b8c9d0480679cec949a15a8a53f68a16d10827de5da669a8685faf68e5ebe5',
			);
		}
	});
});
