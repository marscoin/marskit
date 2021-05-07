import {
	createWallet,
	setupOnChainTransaction,
	updateOnChainTransaction,
	updateWallet,
} from '../src/store/actions/wallet';
import { getSelectedWallet } from '../src/utils/wallet';
import { TAvailableNetworks } from '../src/utils/networks';
import { mnemonic, walletState } from './utils/dummy-wallet';
import {
	createPsbtTransaction,
	createTransaction,
} from '../src/utils/wallet/transactions';

describe('On chain transactions', () => {
	beforeAll(async () => {
		//Seed wallet data including utxo and transaction data
		await createWallet({
			mnemonic,
			addressAmount: 5,
			changeAddressAmount: 5,
		});

		await updateWallet({ wallets: { wallet0: walletState } });

		setupOnChainTransaction({});
	});

	it('Creates an on chain transaction from the transaction store', async () => {
		const selectedNetwork: TAvailableNetworks = 'bitcoinTestnet';
		const selectedWallet = getSelectedWallet();

		await updateOnChainTransaction({
			selectedNetwork,
			selectedWallet,
			transaction: {
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

		expect(res.value).toEqual(
			'02000000000102a27d976282635c354ebb46e5c7f7e105add7189b54186b80e80a97cf9f76c983000000000000000000d5e737837bb3a2e20d47dae50303f38b1e4155849e96e0dd90fd7abc1def276900000000000000000002112700000000000017a9147a40d326e4de19353e2bf8b3f15b395c88b2d2418745e1010000000000160014eb10a70676e60270bd682ef883f7badc7d10e40c02473044022040cf4983777147a2b3d6cbc7e31ca2de8195f2195e0ef8943e4a4491405ae6a402202221a6c4648f2dfaee013ca556e1925a24c9a03a242f5d71c67b835bb9cb94140121032e87df36244a39252d5dda35559c9be603c5f81b75105b5d2587746cf845016b02473044022008bd651cf8b90b82832b2b38c54de6445ae92e49719e0fc34a07f7f52fa04fd702203a28d95d11c853c16a67e16b98fca04605d390a6f487b49414a3e908cc84a34e0121033e3cf8b26986d5e865537944c15d7c88648e0f7fa5d73b32ed6a65ca444dc54c00000000',
		);
	});

	it("Creates a PSBT with funding inputs (unsigned) usable by LND's fundingStateStep", async () => {
		const selectedNetwork: TAvailableNetworks = 'bitcoinTestnet';
		const selectedWallet = getSelectedWallet();

		//TODO use real funding tx detail from a Lnd node
		await updateOnChainTransaction({
			selectedNetwork,
			selectedWallet,
			transaction: {
				outputs: [
					{
						value: 10001,
						index: 0,
						address: '2N4Pe5o1sZKcXdYC3JVVeJKMXCmEZgVEQFa',
					},
				],
			},
		});

		const res = await createPsbtTransaction({
			selectedWallet,
			selectedNetwork,
		});
		if (res.isErr()) {
			expect(res.error.message).toBeUndefined();
			return;
		}

		expect(res.value.toBase64()).toEqual(
			'cHNidP8BAJsCAAAAAqJ9l2KCY1w1TrtG5cf34QWt1xibVBhrgOgKl8+fdsmDAAAAAAAAAAAA1ec3g3uzouINR9rlAwPzix5BVYSeluDdkP16vB3vJ2kAAAAAAAAAAAACEScAAAAAAAAXqRR6QNMm5N4ZNT4r+LPxWzlciLLSQYdF4QEAAAAAABYAFOsQpwZ25gJwvWgu+IP3utx9EOQMAAAAAAABAR9A4gEAAAAAABYAFMVrzRt7p05ZCLwvnEbI19QCGkBvAAEBHxAnAAAAAAAAFgAUsPqfdql0Z8oj9KFrmohp2B2U4SwAAAA=',
		);
	});

	// it('Creates a fully signed transaction from a PSBT', async () => {
	// 	expect('TODO').toEqual('TODO');
	// });
});
