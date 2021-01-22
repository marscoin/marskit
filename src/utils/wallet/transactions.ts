import { err, ok, Result } from '../result';
import * as electrum from 'rn-electrum-client/helpers';
import { validateAddress } from '../scanner';
import { networks, TAvailableNetworks } from '../networks';
import { getKeychainValue } from '../helpers';
import { IUtxo, TAddressType } from '../../store/types/wallet';
import {
	getCurrentWallet,
	getMnemonicPhrase,
	getSelectedNetwork,
	getSelectedWallet,
	getTransactions,
} from './index';
import { BIP32Interface, Psbt } from 'bitcoinjs-lib';

const bitcoin = require('bitcoinjs-lib');
const bip21 = require('bip21');
const bip39 = require('bip39');
const bip32 = require('bip32');

/*
 * Attempts to parse any given string as an on-chain payment request.
 * Returns an error if invalid.
 */
export const parseOnChainPaymentRequest = (
	data = '',
): Result<{
	address: string;
	network: TAvailableNetworks;
	sats: number;
	message: string;
}> => {
	try {
		if (!data) {
			return err(data);
		}

		let validateAddressResult = validateAddress({ address: data });
		if (
			validateAddressResult.isValid &&
			!data.includes(':' || '?' || '&' || '//')
		) {
			return ok({
				address: data,
				network: validateAddressResult.network,
				sats: 0,
				message: '',
			});
		}

		//Determine if we need to parse any invoice data.
		if (data.includes(':' || '?' || '&' || '//')) {
			try {
				//Remove slashes
				if (data.includes('//')) {
					data = data.replace('//', '');
				}
				//bip21.decode will throw if anything other than "bitcoin" is passed to it.
				//Replace any instance of "testnet" or "litecoin" with "bitcoin"
				if (data.includes(':')) {
					data = data.substring(data.indexOf(':') + 1);
					data = `bitcoin:${data}`;
				}
				const result = bip21.decode(data);
				const address = result.address;
				validateAddressResult = validateAddress({ address });
				//Ensure address is valid
				if (!validateAddressResult.isValid) {
					return err(data);
				}
				let amount = 0;
				let message = '';
				try {
					amount = Number(result.options.amount) || 0;
				} catch (e) {}
				try {
					message = result.options.message || '';
				} catch (e) {}
				return ok({
					address,
					network: validateAddressResult.network,
					sats: amount * 100000000,
					message,
				});
			} catch {
				return err(data);
			}
		}
		return err(data);
	} catch {
		return err(data);
	}
};

const shuffleArray = (arr): Array<any> => {
	if (!arr) {
		return arr;
	}
	for (let i = arr.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[arr[i], arr[j]] = [arr[j], arr[i]];
	}
	return arr;
};

const setReplaceByFee = ({
	psbt,
	setRbf = true,
}: {
	psbt: Psbt | any;
	setRbf: boolean;
}): void => {
	try {
		const defaultSequence = bitcoin.Transaction.DEFAULT_SEQUENCE;
		//Cannot set replace-by-fee on transaction without inputs.
		const ins = psbt.data.globalMap.unsignedTx.tx.ins;
		if (ins.length !== 0) {
			ins.forEach((x) => {
				if (setRbf) {
					if (x.sequence >= defaultSequence - 1) {
						x.sequence = 0;
					}
				} else {
					if (x.sequence < defaultSequence - 1) {
						x.sequence = defaultSequence;
					}
				}
			});
		}
	} catch (e) {}
};

/*
	Source:
	https://gist.github.com/junderw/b43af3253ea5865ed52cb51c200ac19c
	Usage:
	getByteCount({'MULTISIG-P2SH:2-4':45},{'P2PKH':1}) Means "45 inputs of P2SH Multisig and 1 output of P2PKH"
	getByteCount({'P2PKH':1,'MULTISIG-P2SH:2-3':2},{'P2PKH':2}) means "1 P2PKH input and 2 Multisig P2SH (2 of 3) inputs along with 2 P2PKH outputs"
*/
export const getByteCount = (inputs, outputs, message = ''): number => {
	try {
		let totalWeight = 0;
		let hasWitness = false;
		let inputCount = 0;
		let outputCount = 0;
		// assumes compressed pubkeys in all cases.
		let types = {
			inputs: {
				'MULTISIG-P2SH': 49 * 4,
				'MULTISIG-P2WSH': 6 + 41 * 4,
				'MULTISIG-P2SH-P2WSH': 6 + 76 * 4,
				P2PKH: 148 * 4,
				P2WPKH: 108 + 41 * 4,
				'P2SH-P2WPKH': 108 + 64 * 4,
				bech32: 108 + 41 * 4 + 1,
				segwit: 108 + 64 * 4 + 1,
				legacy: 148 * 4 + 1,
			},
			outputs: {
				P2SH: 32 * 4,
				P2PKH: 34 * 4,
				P2WPKH: 31 * 4,
				P2WSH: 43 * 4,
				bech32: 31 * 4 + 1,
				segwit: 32 * 4 + 1,
				legacy: 34 * 4 + 1,
			},
		};

		const checkUInt53 = (n): void => {
			if (n < 0 || n > Number.MAX_SAFE_INTEGER || n % 1 !== 0) {
				throw new RangeError('value out of range');
			}
		};

		const varIntLength = (number): number => {
			checkUInt53(number);

			return number < 0xfd
				? 1
				: number <= 0xffff
				? 3
				: number <= 0xffffffff
				? 5
				: 9;
		};

		Object.keys(inputs).forEach(function (key) {
			checkUInt53(inputs[key]);
			if (key.slice(0, 8) === 'MULTISIG') {
				// ex. "MULTISIG-P2SH:2-3" would mean 2 of 3 P2SH MULTISIG
				var keyParts = key.split(':');
				if (keyParts.length !== 2) {
					throw new Error('invalid input: ' + key);
				}
				var newKey = keyParts[0];
				var mAndN = keyParts[1].split('-').map(function (item) {
					// eslint-disable-next-line radix
					return parseInt(item);
				});

				totalWeight += types.inputs[newKey] * inputs[key];
				var multiplyer = newKey === 'MULTISIG-P2SH' ? 4 : 1;
				totalWeight +=
					(73 * mAndN[0] + 34 * mAndN[1]) * multiplyer * inputs[key];
			} else {
				totalWeight += types.inputs[key] * inputs[key];
			}
			inputCount += inputs[key];
			if (key.indexOf('W') >= 0) {
				hasWitness = true;
			}
		});

		Object.keys(outputs).forEach(function (key) {
			checkUInt53(outputs[key]);
			totalWeight += types.outputs[key] * outputs[key];
			outputCount += outputs[key];
		});

		if (hasWitness) {
			totalWeight += 2;
		}

		totalWeight += 8 * 4;
		totalWeight += varIntLength(inputCount) * 4;
		totalWeight += varIntLength(outputCount) * 4;

		let messageByteCount = 0;
		try {
			messageByteCount = message.length;
			//Multiply by 2 to help ensure Electrum servers will broadcast the tx.
			messageByteCount = messageByteCount * 2;
		} catch {}
		return Math.ceil(totalWeight / 4) + messageByteCount;
	} catch (e) {
		return 256;
	}
};

/*
 * Attempt to estimate the current fee for a given wallet and its UTXO's
 */
export const getTotalFee = ({
	fee = 1,
	selectedWallet = undefined,
	selectedNetwork = undefined,
	spendMaxAmount = false,
	message = '',
}: {
	fee: number;
	selectedWallet?: undefined | string;
	selectedNetwork?: undefined | TAvailableNetworks;
	spendMaxAmount?: boolean;
	message?: string;
}): number => {
	const fallBackFee = 250;
	try {
		if (!selectedNetwork) {
			selectedNetwork = getSelectedNetwork();
		}
		if (!selectedWallet) {
			selectedWallet = getSelectedWallet();
		}
		const { currentWallet } = getCurrentWallet({
			selectedNetwork,
			selectedWallet,
		});

		let utxoLength = 1;
		try {
			const utxos = currentWallet.utxos[selectedNetwork];
			utxoLength = Object.keys(utxos).length;
		} catch {}

		const addressType = currentWallet.addressType[selectedNetwork];
		const transactionByteCount =
			getByteCount(
				{ [addressType]: utxoLength },
				{ [addressType]: spendMaxAmount ? 1 : 2 },
				message,
			) || fallBackFee;
		return transactionByteCount * Number(fee) || fallBackFee;
	} catch {
		return Number(fee) * fallBackFee || fallBackFee;
	}
};

export interface ICreateTransaction {
	wallet?: string;
	utxos?: IUtxo[];
	balance?: number;
	address: string;
	fee: number;
	amount: number;
	changeAddress?: string | undefined;
	selectedNetwork: TAvailableNetworks;
	message: string;
	addressType: TAddressType;
}
export const createTransaction = ({
	wallet = undefined,
	utxos = [], //Current utxos.
	balance = 0, //Current balance in sats.
	address = '', //Address to send to.
	fee = 2, //sats per byte.
	amount = 0, //Amount to send to recipient.
	changeAddress = undefined, //Where to send change. No change address need for "maxSend" transactions.
	selectedNetwork = 'bitcoin',
	message = '', //OP_RETURN message.
	addressType = 'bech32',
}: ICreateTransaction): Promise<
	Result<{
		rawTx: string;
		rbfData: ICreateTransaction;
	}>
> => {
	const { currentWallet, selectedWallet } = getCurrentWallet({
		selectedNetwork,
		selectedWallet: wallet,
	});
	//Get UTXO's if none were provided.
	if (typeof utxos === 'object') {
		if (Object.values(utxos).length <= 0) {
			//Grab utxos from store.
			utxos = Object.values(currentWallet.utxos[selectedNetwork]);
		} else {
			//Grab utxo values.
			utxos = Object.values(utxos);
		}
	}

	//Get balance of current wallet if none was provided.
	if (!balance) {
		balance = currentWallet.balance[selectedNetwork];
	}

	return new Promise(async (resolve) => {
		try {
			const network = networks[selectedNetwork];
			const totalFee =
				getByteCount(
					{ [addressType]: utxos.length },
					{ [addressType]: changeAddress ? 2 : 1 },
					message,
				) * fee;

			let targets: {
				address?: string;
				value: number;
				script?: Buffer | undefined;
			}[] = [{ address, value: amount }];

			//Change address and amount to send back to wallet.
			if (changeAddress) {
				targets.push({
					address: changeAddress,
					value: balance - (amount + totalFee),
				});
			}

			//Embed any OP_RETURN messages.
			if (message !== '') {
				const messageLength = message.length;
				const lengthMin = 5;
				//This is a patch for the following: https://github.com/coreyphillips/moonshine/issues/52
				if (messageLength > 0 && messageLength < lengthMin) {
					message += ' '.repeat(lengthMin - messageLength);
				}
				const data = Buffer.from(message, 'utf8');
				const embed = bitcoin.payments.embed({
					data: [data],
					network,
				});
				targets.push({ script: embed.output!, value: 0 });
			}

			//Setup rbfData (Replace-By-Fee Data) for later use.
			/*
			 * TODO: Remove the need to save rbf data here. Create an independent function that will fetch rbf data if possible for any tx.
			 */
			let rbfData: ICreateTransaction = {
				address,
				fee,
				amount,
				balance,
				utxos,
				changeAddress,
				wallet: selectedWallet,
				selectedNetwork,
				message,
				addressType,
			};

			const getMnemonicPhraseResult = await getMnemonicPhrase(selectedWallet);
			if (getMnemonicPhraseResult.error) {
				return;
			}

			//Attempt to acquire the bip39Passphrase if available
			let bip39Passphrase = '';
			try {
				const key = `${selectedWallet}passphrase`;
				const bip39PassphraseResult = await getKeychainValue({ key });
				if (!bip39PassphraseResult.error && bip39PassphraseResult.data) {
					bip39Passphrase = bip39PassphraseResult.data;
				}
			} catch {}

			const mnemonic = getMnemonicPhraseResult.data;
			const seed = bip39.mnemonicToSeedSync(mnemonic, bip39Passphrase);
			const root = bip32.fromSeed(seed, network);
			const psbt = new bitcoin.Psbt({ network });

			//Add Inputs
			const utxosLength = utxos.length;
			for (let i = 0; i < utxosLength; i++) {
				try {
					const utxo: IUtxo = utxos[i];
					const path = utxo.path;
					const keyPair: BIP32Interface = root.derivePath(path);
					await addInput({
						psbt,
						addressType,
						keyPair,
						utxo,
						selectedNetwork,
					});
				} catch (e) {
					console.log(e);
				}
			}

			//Set RBF if supported and prompted via rbf in Settings.
			setReplaceByFee({ psbt, setRbf: true });

			//Shuffle and add outputs.
			targets = shuffleArray(targets);
			await Promise.all(
				targets.map((target) => {
					//Check if OP_RETURN
					let isOpReturn = false;
					try {
						isOpReturn = !!target.script;
					} catch (e) {}
					if (isOpReturn) {
						if (target?.script) {
							psbt.addOutput({
								script: target.script,
								value: target.value,
							});
						}
					} else {
						if (target?.address && target?.value) {
							psbt.addOutput({
								address: target.address,
								value: target.value,
							});
						}
					}
				}),
			);

			//Loop through and sign
			let index = 0;
			utxos.forEach((utxo) => {
				try {
					const path = utxo.path;
					const keyPair = root.derivePath(path);
					psbt.signInput(index, keyPair);
					index++;
				} catch (e) {
					console.log(e);
				}
			});
			psbt.finalizeAllInputs();
			const rawTx = psbt.extractTransaction().toHex();
			return resolve(ok({ rawTx, rbfData }));
		} catch (e) {
			return resolve(err(e));
		}
	});
};

export interface IAddInput {
	psbt: Psbt;
	addressType: TAddressType;
	keyPair: BIP32Interface;
	utxo: IUtxo;
	selectedNetwork: TAvailableNetworks;
}
export const addInput = async ({
	psbt,
	addressType,
	keyPair,
	utxo,
	selectedNetwork,
}: IAddInput): Promise<Result<string>> => {
	try {
		const network = networks[selectedNetwork];
		if (addressType === 'bech32') {
			const p2wpkh = bitcoin.payments.p2wpkh({
				pubkey: keyPair.publicKey,
				network,
			});
			psbt.addInput({
				hash: utxo.tx_hash,
				index: utxo.tx_pos,
				witnessUtxo: {
					script: p2wpkh.output,
					value: utxo.value,
				},
			});
		}

		if (addressType === 'segwit') {
			const p2wpkh = bitcoin.payments.p2wpkh({
				pubkey: keyPair.publicKey,
				network,
			});
			const p2sh = bitcoin.payments.p2sh({ redeem: p2wpkh, network });
			psbt.addInput({
				hash: utxo.tx_hash,
				index: utxo.tx_pos,
				witnessUtxo: {
					script: p2sh.output,
					value: utxo.value,
				},
				redeemScript: p2sh.redeem.output,
			});
		}

		if (addressType === 'legacy') {
			const transaction = await getTransactions({
				selectedNetwork,
				txHashes: [{ tx_hash: utxo.tx_hash }],
			});
			if (transaction.isErr()) {
				return err(transaction.error.message);
			}
			const hex = transaction[0].value.data.result.hex;
			const nonWitnessUtxo = Buffer.from(hex, 'hex');
			psbt.addInput({
				hash: utxo.tx_hash,
				index: utxo.tx_pos,
				nonWitnessUtxo,
			});
		}
		return ok('Success');
	} catch {
		return err('Unable to add input.');
	}
};

export const broadcastTransaction = async ({
	rawTx = '',
	selectedNetwork = undefined,
}: {
	rawTx: string;
	selectedNetwork?: undefined | TAvailableNetworks;
}): Promise<Result<string>> => {
	if (!selectedNetwork) {
		selectedNetwork = getSelectedNetwork();
	}

	const broadcastResponse = await electrum.broadcastTransaction({
		id: 1,
		rawTx,
		network: selectedNetwork,
	});
	if (broadcastResponse.error) {
		return err(broadcastResponse.data);
	}
	return ok(broadcastResponse.data);
};
