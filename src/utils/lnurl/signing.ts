import { err, ok, Result } from '../result';
import * as bip39 from 'bip39';
import * as bip32 from 'bip32';
import { HMAC as sha256HMAC } from 'fast-sha256';
import secp256k1 from 'secp256k1';
import { networks } from '../networks';

const stringToUint8Array = (str: string) => {
	return Uint8Array.from(str, (x) => x.charCodeAt(0));
};

const hexToUint8Array = (hexString: string) => {
	return new Uint8Array(
		hexString.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16)),
	);
};

const toHexString = (bytes: Uint8Array) =>
	bytes.reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '');

const byteArrayToLong = (byteArray: Uint8Array) => {
	let value = 0;
	for (let i = byteArray.length - 1; i >= 0; i--) {
		value = value * 256 + byteArray[i];
	}

	return value;
};

interface DerivedLinkingKeys {
	privateKey: string;
	publicKey: string;
}

export const deriveLinkingKeys = (
	mnemonic: string,
	bip39Passphrase: string,
	domain,
): Result<DerivedLinkingKeys> => {
	const seed = bip39.mnemonicToSeedSync(mnemonic, bip39Passphrase);
	const root = bip32.fromSeed(seed, networks.bitcoinTestnet);

	//STEP 1 - Get hashing key
	const hashingKey = root.derivePath("m/138'/0").privateKey?.toString('hex');
	if (!hashingKey) {
		return err('Failed to derive hashingKey');
	}

	//STEP 2 - hmacSha256 domain
	const hmac = new sha256HMAC(stringToUint8Array(hashingKey));
	const derivationMaterial = hmac.update(stringToUint8Array(domain)).digest();

	//STEP 3 - First 16 bytes are taken from resulting hash and then turned into a sequence of 4 Long values which are in turn used to derive a service-specific linkingKey using m/138'/<long1>/<long2>/<long3>/<long4> path
	let path = "m/138'";
	for (let index = 0; index < 4; index++) {
		path = `${path}/${byteArrayToLong(
			derivationMaterial.slice(index * 4, index * 4 + 4),
		)}`;
	}

	const derivePrivateKey = root.derivePath(path);
	const privateKey = derivePrivateKey.privateKey?.toString('hex') || '';
	const publicKey = derivePrivateKey.publicKey?.toString('hex') || '';

	return ok({ privateKey, publicKey });
};

export const signK1 = (
	k1: string,
	linkingPrivateKey: string,
): Result<string> => {
	const sigObj = secp256k1.ecdsaSign(
		hexToUint8Array(k1),
		hexToUint8Array(linkingPrivateKey),
	);

	// Get signature
	const signature = secp256k1.signatureExport(sigObj.signature);
	const encodedSignature = toHexString(signature);

	return ok(encodedSignature);
};

export const createCallbackUrl = (
	callback: string,
	signature: string,
	linkingPublicKey: string,
): Result<string> => {
	return ok(`${callback}&sig=${signature}&key=${linkingPublicKey}`);
};
