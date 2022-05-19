import { deriveMnemonicPhrases } from '../src/utils/wallet';
import { mnemonic } from './utils/dummy-wallet';

describe('Wallet Methods', () => {
	it('Derive multiple mnemonic phrases for lightning, tokens and slashtags via the on-chain phrase.', async () => {
		const res = await deriveMnemonicPhrases(mnemonic);
		if (res.isErr()) {
			expect(res.error.message).toEqual('');
			return;
		}
		expect(res.value.onchain).toEqual(mnemonic);
		expect(res.value.lightning).toEqual(
			'old found shock tenant merit tower foster chase sauce stool book enhance public key whip group retreat member cabin blanket sorry pole gym wink',
		);
		expect(res.value.tokens).toEqual(
			'inspire sick rule wild near rebuild pride tomato shell come drip reduce street steel warrior project radar sister day title spice execute evolve outside',
		);
		expect(res.value.slashtags).toEqual(
			'symbol between rule refuse can salt rack slush lesson excite quality flavor lunar reunion ramp abandon plate narrow bulk machine asset cross violin senior',
		);
	});
});
