import {
	createWallet,
	updateOnChainTransaction,
	updateWallet,
} from '../src/store/actions/wallet';
import { getCurrentWallet, getSelectedWallet } from '../src/utils/wallet';
import { TAvailableNetworks } from '../src/utils/networks';
import { mnemonic, wallet } from './utils/dummy-wallet';
import {
	createFundingTransaction,
	createPsbtTransaction,
	createTransaction,
} from '../src/utils/wallet/transactions';
import { IOnChainTransactionData } from '../src/store/types/wallet';

describe('On chain transactions', () => {
	beforeAll(async () => {
		//Seed wallet data including utxo and transaction data
		await createWallet({
			mnemonic,
			addressAmount: 5,
			changeAddressAmount: 5,
		});

		await updateWallet({ wallets: { wallet0: wallet } });
	});

	it('Creates an on chain transaction from on chain transaction store', async () => {
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
			'02000000000102d5e737837bb3a2e20d47dae50303f38b1e4155849e96e0dd90fd7abc1def2769000000000000000000a27d976282635c354ebb46e5c7f7e105add7189b54186b80e80a97cf9f76c98300000000000000000002112700000000000017a9147a40d326e4de19353e2bf8b3f15b395c88b2d2418745e1010000000000160014eb10a70676e60270bd682ef883f7badc7d10e40c02483045022100c35395bde6cd593c3765e96d742158a98931ab149bf4eb32eae04c233abeacb70220067f67d94edbd825ae5c1e7640f2af95fc7b6369dcf214929ebde1a0cb623e7c0121033e3cf8b26986d5e865537944c15d7c88648e0f7fa5d73b32ed6a65ca444dc54c024730440220093f937a74aaa751ba1abf21f83b2b2bc74a05f96ed3dfb80fed1ff9fba3748602200d99947858cebc62b1b3c5cdd97926332217dad444c73f95d0f113f83de9b25e0121032e87df36244a39252d5dda35559c9be603c5f81b75105b5d2587746cf845016b00000000',
		);
	});

	it('Creates a PSBT with funding inputs (unsigned)', async () => {
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
		expect(res.isOk()).toEqual(true);
		if (res.isErr()) {
			return;
		}

		expect(res.value.toBase64()).toEqual(
			'cHNidP8BAJsCAAAAAtXnN4N7s6LiDUfa5QMD84seQVWEnpbg3ZD9erwd7ydpAAAAAAAAAAAAon2XYoJjXDVOu0blx/fhBa3XGJtUGGuA6AqXz592yYMAAAAAAAAAAAACEScAAAAAAAAXqRR6QNMm5N4ZNT4r+LPxWzlciLLSQYdF4QEAAAAAABYAFOsQpwZ25gJwvWgu+IP3utx9EOQMAAAAAAABAR8QJwAAAAAAABYAFLD6n3apdGfKI/Sha5qIadgdlOEsAAEBH0DiAQAAAAAAFgAUxWvNG3unTlkIvC+cRsjX1AIaQG8AAAA=',
		);
	});

	it('Creates a fully signed transaction from a PSBT', async () => {
		expect('TODO').toEqual('TODO');
	});
});
