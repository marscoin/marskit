import { createWallet } from '../src/store/actions/wallet';
import WebSocket from 'ws';
import { createBackup, restoreFromBackup } from '../src/utils/backup/backup';
import { bytesToString, stringToBytes } from '../src/utils/converters';
import { getDispatch, getStore } from '../src/store/helpers';
import actions from '../src/store/actions/actions';
import { getKeychainValue, setKeychainValue } from '../src/utils/helpers';
import {
	resetOmniBoltStore,
	updateOmniboltCheckpoint,
} from '../src/store/actions/omnibolt';
import { resetLightningStore } from '../src/store/actions/lightning';
import { createOmniboltId } from '../src/utils/omnibolt';
import { IAddressData, TAddressFormat } from '../src/store/types/wallet';
import { TAvailableNetworks } from '../src/utils/networks';
global.WebSocket = WebSocket;

/**
 * Gets first bitcoin address for a wallet
 * @param walletKey
 * @param type
 * @param addressFormat
 * @param selectedNetwork
 */
const getFirstAddress = (
	walletKey: string,
	type: 'addresses' | 'changeAddresses',
	addressFormat: TAddressFormat = 'p2wpkh',
	selectedNetwork: TAvailableNetworks = 'bitcoinTestnet',
): string => {
	const addresses: IAddressData =
		getStore().wallet.wallets[walletKey][type][selectedNetwork][addressFormat];
	return Object.values(addresses)[0].address;
};

jest.setTimeout(150000);

describe('Backup', () => {
	//In the app this would be stored and retrieved from the Backpack server, a local file, iCloud or Google drive
	it('Backup a wallet to a serialised string and restore the wallet from it', async () => {
		//TODO create multiple wallets, lightning channel states, omni, etc
		const walletKey = 'wallet0'; //If we have multiple wallets one day make this an array
		const walletKeyOmnibolt = 'wallet0omnibolt';

		await createWallet({});

		await createOmniboltId({});

		const { data: originalMnemonic } = await getKeychainValue({
			key: walletKey,
		});

		const { data: originalOmniMnemonic } = await getKeychainValue({
			key: walletKeyOmnibolt,
		});

		const firstAddressBeforeBackup = getFirstAddress(walletKey, 'addresses');
		const firstChangeAddressBeforeBackup = getFirstAddress(
			walletKey,
			'changeAddresses',
		);

		const testChannelID = 'TEST_channelId';
		await updateOmniboltCheckpoint({
			data: { funder_node_address: 'TEST_funder_node_address' },
			channelId: testChannelID,
			checkpoint: 'channelAccept',
		});

		const backupRes = await createBackup();
		expect(backupRes.isOk()).toEqual(true);
		if (backupRes.isErr()) {
			return;
		}

		const backupContent = bytesToString(backupRes.value);

		//Nuke all stored seeds before restoring
		await setKeychainValue({ key: walletKey, value: '' });
		await setKeychainValue({ key: walletKeyOmnibolt, value: '' });
		getDispatch()({
			type: actions.RESET_WALLET_STORE,
		});
		resetOmniBoltStore();
		resetLightningStore();

		//TODO maybe also test wallets in store before and after are the same

		const restoreRes = await restoreFromBackup(stringToBytes(backupContent));
		expect(restoreRes.isOk()).toEqual(true);
		if (restoreRes.isErr()) {
			return;
		}

		//All wallet details need to match the state it was before the backup
		const { data: restoredMnemonic } = await getKeychainValue({
			key: walletKey,
		});

		expect(restoredMnemonic).not.toEqual('');
		expect(restoredMnemonic).toEqual(originalMnemonic);
		expect(getFirstAddress(walletKey, 'addresses')).toEqual(
			firstAddressBeforeBackup,
		);

		const { data: restoredOmniMnemonic } = await getKeychainValue({
			key: walletKeyOmnibolt,
		});

		expect(restoredOmniMnemonic).not.toEqual('');
		expect(restoredOmniMnemonic).toEqual(originalOmniMnemonic);

		expect(firstChangeAddressBeforeBackup).not.toEqual(undefined);
		expect(getFirstAddress(walletKey, 'changeAddresses')).toEqual(
			firstChangeAddressBeforeBackup,
		);

		//Basic OmniBolt restore test
		expect(
			getStore().omnibolt.wallets.wallet0.checkpoints.bitcoinTestnet[
				testChannelID
			],
		).toBeDefined();
	});
});
