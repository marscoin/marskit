import {
	slashtagsPrimaryKey,
	generateMnemonicPhraseFromEntropy,
} from '../../src/utils/wallet';
import * as bip39 from 'bip39';

describe('slashtagsPrimaryKey', () => {
	it('should generate the correct primaryKey from mnemonic phrase', async () => {
		const mnemonic = generateMnemonicPhraseFromEntropy('foo');
		const seed = await bip39.mnemonicToSeed(mnemonic);

		expect(await slashtagsPrimaryKey(seed)).toEqual(
			'85ddeba6938711153ea330c0c2d9bc2414cb117754f88b7454a6f06130ecbfd3',
		);
	});
});
