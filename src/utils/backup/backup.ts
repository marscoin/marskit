import Scheme from './protos/scheme';
import { err, ok, Result } from '../result';
import {
	backpackRegister,
	backpackRetrieve,
	backpackStore,
	IBackpackAuth,
} from './backpack';

const serialisedBackup = (): Uint8Array => {
	//Wallets
	const wallets: Scheme.Wallet[] = [];
	wallets.push(new Scheme.Wallet({ key: 'wallet0', seed: 'todo todo' }));
	wallets.push(new Scheme.Wallet({ key: 'wallet1', seed: 'todo2 todo2' }));

	//TODO LND channels
	const lnd = new Scheme.LND();
	lnd.channelState.push('my first channel state');
	lnd.channelState.push('my second channel state');

	//TODO omni

	const backup = new Scheme.Backup({ wallets, lnd });

	return Scheme.Backup.encode(backup).finish();
};

export const performBackup = async (): Promise<Result<string>> => {
	const backup = serialisedBackup();

	const storeRes = await backpackStore(backup);

	return storeRes;
};

export const restoreFromBackup = async (
	auth: IBackpackAuth,
): Promise<Result<string>> => {
	//Caches the auth details again
	const registerRes = await backpackRegister(auth);
	if (registerRes.isErr()) {
		return err(registerRes.error);
	}

	const retrieveRes = await backpackRetrieve();
	if (retrieveRes.isErr()) {
		return err(retrieveRes.error);
	}

	const backup = Scheme.Backup.decode(retrieveRes.value);

	//TODO set state from backup

	return ok(
		`Restored ${backup.wallets.length} on chain wallets and ${
			backup.lnd?.channelState?.length ?? 0
		} lightning channels`,
	);
};
