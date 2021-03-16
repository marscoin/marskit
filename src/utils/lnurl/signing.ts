import { err, ok, Result } from '../result';
import * as bip39 from 'bip39';
import * as bip32 from 'bip32';
import { HMAC as sha256HMAC } from 'fast-sha256';
import secp256k1 from 'secp256k1';
import { INetwork } from '../networks';
import {
	bytesToHexString,
	hexStringToBytes,
	stringToBytes,
	bytesToLong,
} from '../converters';

interface DerivedLinkingKeys {
	privateKey: string;
	publicKey: string;
}

/**
 * Derive linking keys from BIP-32 based wallet that can be used to sign LNURL challenge requests.
 * https://github.com/fiatjaf/lnurl-rfc/blob/master/lnurl-auth.md#linkingkey-derivation-for-bip-32-based-wallets
 * @param domain
 * @param network
 * @param mnemonic
 * @param bip39Passphrase
 * @returns {Err<unknown> | Ok<{privateKey: string, publicKey: string}>}
 */
export const deriveLinkingKeys = (
	domain,
	network: INetwork,
	mnemonic: string,
	bip39Passphrase?: string,
): Result<DerivedLinkingKeys> => {
	const seed = bip39.mnemonicToSeedSync(mnemonic, bip39Passphrase);
	const root = bip32.fromSeed(seed, network);

	//STEP 1 - Get hashing key
	const hashingKey = root.derivePath("m/138'/0").privateKey?.toString('hex');
	if (!hashingKey) {
		return err('Failed to derive hashingKey');
	}

	//STEP 2 - hmacSha256 domain
	const hmac = new sha256HMAC(stringToBytes(hashingKey));
	const derivationMaterial = hmac.update(stringToBytes(domain)).digest();

	//STEP 3 - First 16 bytes are taken from resulting hash and then turned into a sequence of 4 Long values which are in turn used to derive a service-specific linkingKey using m/138'/<long1>/<long2>/<long3>/<long4> path
	let path = "m/138'";
	for (let index = 0; index < 4; index++) {
		path = `${path}/${bytesToLong(
			derivationMaterial.slice(index * 4, index * 4 + 4),
		)}`;
	}

	const derivePrivateKey = root.derivePath(path);
	const privateKey = derivePrivateKey.privateKey?.toString('hex') || '';
	const publicKey = derivePrivateKey.publicKey?.toString('hex') || '';

	return ok({ privateKey, publicKey });
};

/**
 * Sign k1 challenge request from a LNURL
 * https://github.com/fiatjaf/lnurl-rfc/blob/master/lnurl-auth.md#wallet-to-service-interaction-flow
 * @param k1
 * @param linkingPrivateKey
 * @returns {Ok<string>}
 */
export const signK1 = (
	k1: string,
	linkingPrivateKey: string,
): Result<string> => {
	const sigObj = secp256k1.ecdsaSign(
		hexStringToBytes(k1),
		hexStringToBytes(linkingPrivateKey),
	);

	// Get signature
	const signature = secp256k1.signatureExport(sigObj.signature);
	const encodedSignature = bytesToHexString(signature);

	return ok(encodedSignature);
};
