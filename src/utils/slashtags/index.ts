import { err, ok, Result } from '../result';
import { getKeychainValue, setKeychainValue } from '../helpers';
import { THexKeyPair } from '@synonymdev/react-native-slashtags';

const publicKey = 'slashtagsPubKey';
const secretKey = 'slashtagsSecKey';

export const setSlashtagsKeyPair = async (
	keyPair: THexKeyPair,
): Promise<Result<boolean>> => {
	//TODO use secp256k1 and derive keypair from main wallet seed

	try {
		await setKeychainValue({ key: publicKey, value: keyPair.publicKey });
		await setKeychainValue({ key: secretKey, value: keyPair.secretKey });

		return ok(true);
	} catch (e) {
		return err(e);
	}
};

export const getSlashtagsKeyPair = async (): Promise<
	Result<THexKeyPair | null>
> => {
	try {
		const publicKeyRes = await getKeychainValue({ key: publicKey });
		const secretKeyRes = await getKeychainValue({ key: secretKey });

		if (!publicKeyRes.error && !secretKeyRes.error) {
			return ok({ publicKey: publicKeyRes.data, secretKey: secretKeyRes.data });
		}

		return ok(null);
	} catch (e) {
		return err(e);
	}
};
