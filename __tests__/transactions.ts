import {
	createWallet,
	setupOnChainTransaction,
	updateBitcoinTransaction,
	updateWallet,
} from '../src/store/actions/wallet';
import { getSelectedWallet } from '../src/utils/wallet';
import { TAvailableNetworks } from '../src/utils/networks';
import { mnemonic, walletState } from './utils/dummy-wallet';
import { createTransaction } from '../src/utils/wallet/transactions';

const selectedNetwork: TAvailableNetworks = 'bitcoinTestnet';

describe('On chain transactions', () => {
	beforeAll(async () => {
		require('../nodejs-assets/nodejs-project/main.js');

		//Seed wallet data including utxo and transaction data
		await createWallet({
			mnemonic,
			addressAmount: 5,
			changeAddressAmount: 5,
			selectedNetwork,
		});

		updateWallet({ wallets: { wallet0: walletState } });

		await setupOnChainTransaction({ selectedNetwork });
	});

	it('Creates an on chain transaction from the transaction store', async () => {
		const selectedWallet = getSelectedWallet();

		await updateBitcoinTransaction({
			selectedNetwork,
			selectedWallet,
			transaction: {
				rbf: true,
				outputs: [
					{
						value: 10001,
						index: 0,
						address: '2N4Pe5o1sZKcXdYC3JVVeJKMXCmEZgVEQFa',
					},
				],
			},
		});

		const res = await createTransaction({
			selectedNetwork,
			selectedWallet,
		});

		if (res.isErr()) {
			expect(res.error.message).toEqual('');
			return;
		}

		expect(res.value.hex).toEqual(
			'020000000001020c0eab3149ba3ed7abd8f4c98eabe2cbb2b7c3590404b66ca0f01addf61ec67100000000000000000051bd848851cadb71bf34e6e0e46b0c4214c2d06ccc1d5ca0f5baefdcf862692000000000000000000002112700000000000017a9147a40d326e4de19353e2bf8b3f15b395c88b2d2418791cc010000000000160014669a9323418693b81d44c19da7b1fe7911b2142902483045022100b24214eccadb5d7754735e32150e44f664ad588e66a2415398f2341e711c06a2022028a87680c01eaa578a22b80ff2d136e7971f69ff7b6dcd5ac759382d5c20addb01210318cb16a8e659f378002e75abe93f064c4ebcd62576bc15019281b635f96840a80247304402202bef617b03c4f9f8585fec97123659074c2e9cc81385288315074dac5c5b643b02203fbfaaf6f998d7f9ac19a49c3ca31487f105899d747993f53fbb7eb6817a279b012102bb6083f2571ecd26f68edeae341c0700463349a84b2044c271e061e813e0cd0300000000',
		);

		expect(res.value.id).toEqual(
			'5354adb3f4549da123802f46817e0a3ce6fb5108b056636674721e4a693a59ff',
		);
	});
});
