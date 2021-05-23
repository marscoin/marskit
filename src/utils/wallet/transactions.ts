import { err, ok, Result } from '../result';
import * as electrum from 'rn-electrum-client/helpers';
import { validateAddress } from '../scanner';
import { networks, TAvailableNetworks } from '../networks';
import { getKeychainValue, reduceValue } from '../helpers';
import {
	defaultOnChainTransactionData,
	IOnChainTransactionData,
	IOutput,
	IUtxo,
	TAddressType,
	TGetByteCountInputs,
	TGetByteCountOutputs,
} from '../../store/types/wallet';
import {
	getCurrentWallet,
	getMnemonicPhrase,
	getSelectedNetwork,
	getSelectedWallet,
	getTransactions,
} from './index';
import { BIP32Interface, Psbt } from 'bitcoinjs-lib';
import { getStore } from '../../store/helpers';
import validate, { getAddressInfo } from 'bitcoin-address-validation';
import { updateOnChainTransaction } from '../../store/actions/wallet';

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
					return err(`Invalid address: ${data}`);
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
					sats: Number((amount * 100000000).toFixed(0)),
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
export const getByteCount = (
	inputs: TGetByteCountInputs = {},
	outputs: TGetByteCountOutputs = {},
	message = '',
): number => {
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
			const addressTypeCount = inputs[key] || 1;
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

				totalWeight += types.inputs[newKey] * addressTypeCount;
				var multiplyer = newKey === 'MULTISIG-P2SH' ? 4 : 1;
				totalWeight +=
					(73 * mAndN[0] + 34 * mAndN[1]) * multiplyer * addressTypeCount;
			} else {
				totalWeight += types.inputs[key] * addressTypeCount;
			}
			inputCount += addressTypeCount;
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

/**
 * Constructs the parameter for getByteCount via an array of addresses.
 * @param {string[]} addresses
 */
export const constructByteCountParam = (
	addresses: string[] = [],
): TGetByteCountInputs | TGetByteCountOutputs => {
	try {
		if (!addresses || addresses.length <= 0) {
			return { P2WPKH: 0 };
		}
		let param = {};
		addresses.map((address) => {
			if (address && validate(address)) {
				const addressType = getAddressInfo(address).type.toUpperCase();
				param[addressType] = param[addressType] ? param[addressType] + 1 : 1;
			}
		});
		return param;
	} catch {
		return { P2WPKH: 0 };
	}
};

/*
 * Attempt to estimate the current fee for a given wallet and its UTXO's
 */
export const getTotalFee = ({
	satsPerByte = 1,
	selectedWallet = undefined,
	selectedNetwork = undefined,
	message = '',
	fundingLightning = false,
}: {
	satsPerByte: number;
	selectedWallet?: undefined | string;
	selectedNetwork?: undefined | TAvailableNetworks;
	message?: string;
	fundingLightning?: boolean | undefined;
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

		const utxos = currentWallet?.utxos[selectedNetwork] || [];
		let outputs: IOutput[] =
			currentWallet?.transaction[selectedNetwork]?.outputs || [];
		const changeAddress =
			currentWallet?.transaction[selectedNetwork]?.changeAddress;

		//Group all utxo & output addresses into their respective array.
		const utxoAddresses = utxos.map((utxo) => utxo.address) || [];
		const outputAddresses =
			outputs.map((output) => {
				if (output.address) {
					return output.address;
				}
			}) || [];
		if (changeAddress) {
			outputAddresses.push(changeAddress);
		}

		//Determine the address type of each address and construct the object for fee calculation
		const inputParam = constructByteCountParam(utxoAddresses);
		// @ts-ignore
		const outputParam = constructByteCountParam(outputAddresses);
		//Increase P2WPKH output address by one for lightning funding calculation.
		if (fundingLightning) {
			outputParam.P2WPKH = (outputParam?.P2WPKH || 0) + 1;
		}

		const transactionByteCount =
			getByteCount(inputParam, outputParam, message) || fallBackFee;
		const totalFee = transactionByteCount * Number(satsPerByte);
		return totalFee > fallBackFee || Number.isNaN(totalFee)
			? totalFee
			: fallBackFee * Number(satsPerByte);
	} catch {
		return Number(satsPerByte) * fallBackFee || fallBackFee;
	}
};

export interface ICreateTransaction {
	selectedWallet?: string | undefined;
	selectedNetwork?: TAvailableNetworks | undefined;
}

export interface ICreatePsbt {
	selectedWallet: string;
	selectedNetwork: TAvailableNetworks;
}

interface ITargets extends IOutput {
	script?: Buffer | undefined;
}

/**
 * Creates a BIP32Interface from the selected wallet's mnemonic and passphrase
 * @param selectedWallet
 * @param selectedNetwork
 * @returns {Promise<Ok<BIP32Interface> | Err<unknown>>}
 */
const getBip32Interface = async (
	selectedWallet: string,
	selectedNetwork: TAvailableNetworks,
): Promise<Result<BIP32Interface>> => {
	const network = networks[selectedNetwork];

	const getMnemonicPhraseResult = await getMnemonicPhrase(selectedWallet);
	if (getMnemonicPhraseResult.error) {
		return err(getMnemonicPhraseResult.data);
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

	return ok(root);
};

/**
 * Returns a PSBT that includes unsigned funding inputs.
 * @param selectedWallet
 * @param selectedNetwork
 * @param transactionData
 * @return {Promise<Ok<Psbt> | Err<unknown>>}
 */
const createPsbtFromTransactionData = async ({
	selectedWallet,
	selectedNetwork,
	transactionData,
}: {
	selectedWallet: string;
	selectedNetwork: TAvailableNetworks;
	transactionData: IOnChainTransactionData;
}): Promise<Result<Psbt>> => {
	const {
		utxos = [],
		outputs = [],
		changeAddress,
		fee = 250,
	} = transactionData;
	let message = transactionData.message;

	//Get balance of current utxos.
	const balance = await getTransactionUtxoValue({
		selectedWallet,
		selectedNetwork,
		utxos,
	});

	//Get value of current outputs.
	const outputValue = getTransactionOutputValue({
		selectedNetwork,
		selectedWallet,
		outputs,
	});

	const { currentWallet } = getCurrentWallet({
		selectedNetwork,
		selectedWallet,
	});

	const network = networks[selectedNetwork];
	//TODO: Get address type by inspecting the address or path.
	const addressType = currentWallet.addressType[selectedNetwork];

	//Collect all outputs.
	let targets: ITargets[] = await Promise.all(outputs.map((output) => output));

	//Change address and amount to send back to wallet.
	if (changeAddress !== '') {
		targets.push({
			address: changeAddress,
			value: balance - (outputValue + fee),
		});
	}

	//Embed any OP_RETURN messages.
	if (message && message.trim() !== '') {
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

	const bip32Res = await getBip32Interface(selectedWallet, selectedNetwork);
	if (bip32Res.isErr()) {
		return err(bip32Res.error);
	}

	const root = bip32Res.value;
	const psbt = new bitcoin.Psbt({ network });

	//Add Inputs from utxos array
	try {
		await Promise.all(
			utxos.map(async (utxo) => {
				const path = utxo.path;
				const keyPair: BIP32Interface = root.derivePath(path);
				await addInput({
					psbt,
					addressType,
					keyPair,
					utxo,
					selectedNetwork,
				});
			}),
		);
	} catch (e) {
		return err(e);
	}

	//Set RBF if supported and prompted via rbf in Settings.
	setReplaceByFee({ psbt, setRbf: true });

	// Shuffle targets if not run from unit test and add outputs.
	if (process.env.JEST_WORKER_ID === undefined) {
		targets = shuffleArray(targets);
	}

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

	return ok(psbt);
};

/**
 * Uses the transaction data store to create an unsigned PSBT with funded inputs
 * @param selectedWallet
 * @param selectedNetwork
 */
export const createFundedPsbtTransaction = async ({
	selectedWallet,
	selectedNetwork,
}: ICreatePsbt): Promise<Result<Psbt>> => {
	const transactionData = getOnchainTransactionData({
		selectedWallet,
		selectedNetwork,
	});

	if (transactionData.isErr()) {
		return err(transactionData.error.message);
	}

	//Create PSBT before signing inputs
	return await createPsbtFromTransactionData({
		selectedWallet,
		selectedNetwork,
		transactionData: transactionData.value,
	});
};

export const signPsbt = ({
	selectedWallet,
	selectedNetwork,
	psbt,
}: {
	selectedWallet: string;
	selectedNetwork: TAvailableNetworks;
	psbt: Psbt;
}): Promise<Result<Psbt>> => {
	return new Promise(async (resolve) => {
		//Loop through and sign our inputs
		const bip32Res = await getBip32Interface(selectedWallet, selectedNetwork);
		if (bip32Res.isErr()) {
			return resolve(err(bip32Res.error));
		}

		const root = bip32Res.value;

		const transactionDataRes = getOnchainTransactionData({
			selectedWallet,
			selectedNetwork,
		});

		if (transactionDataRes.isErr()) {
			return err(transactionDataRes.error.message);
		}

		const { utxos = [] } = transactionDataRes.value;
		await Promise.all(
			utxos.map((utxo, i) => {
				try {
					const path = utxo.path;
					const keyPair = root.derivePath(path);
					psbt.signInput(i, keyPair);
				} catch (e) {
					return resolve(err(e));
				}
			}),
		);
		psbt.finalizeAllInputs();
		return resolve(ok(psbt));
	});
};

/**
 * Creates complete signed transaction using the transaction data store
 * @param selectedWallet
 * @param selectedNetwork
 * @returns {Promise<Ok<string> | Err<string>>}
 */
export const createTransaction = ({
	selectedWallet = undefined,
	selectedNetwork = undefined,
}: ICreateTransaction): Promise<Result<string>> => {
	return new Promise(async (resolve) => {
		if (!selectedWallet) {
			selectedWallet = getSelectedWallet();
		}
		if (!selectedNetwork) {
			selectedNetwork = getSelectedNetwork();
		}

		const transactionDataRes = getOnchainTransactionData({
			selectedWallet,
			selectedNetwork,
		});

		if (transactionDataRes.isErr()) {
			return err(transactionDataRes.error.message);
		}

		const transactionData = transactionDataRes.value;

		try {
			//Create PSBT before signing inputs
			const psbtRes = await createPsbtFromTransactionData({
				selectedWallet,
				selectedNetwork,
				transactionData,
			});

			if (psbtRes.isErr()) {
				return resolve(err(psbtRes.error));
			}

			const psbt = psbtRes.value;

			const signedPsbtRes = await signPsbt({
				selectedWallet,
				selectedNetwork,
				psbt,
			});

			if (signedPsbtRes.isErr()) {
				return resolve(err(signedPsbtRes.error));
			}

			const rawTx = signedPsbtRes.value.extractTransaction().toHex();
			return resolve(ok(rawTx));
		} catch (e) {
			return resolve(err(e));
		}
	});
};

/**
 * Returns onchain transaction data related to the specified network and wallet.
 * @param selectedWallet
 * @param selectedNetwork
 */
export const getOnchainTransactionData = ({
	selectedWallet = undefined,
	selectedNetwork = undefined,
}: {
	selectedWallet: string | undefined;
	selectedNetwork: TAvailableNetworks | undefined;
}): Result<IOnChainTransactionData> => {
	try {
		if (!selectedWallet) {
			selectedWallet = getSelectedWallet();
		}
		if (!selectedNetwork) {
			selectedNetwork = getSelectedNetwork();
		}
		const transaction = getStore().wallet.wallets[selectedWallet].transaction[
			selectedNetwork
		];
		if (transaction) {
			return ok(transaction);
		}
		return err('Unable to get transaction data.');
	} catch (e) {
		return err(e);
	}
};
export interface IAddInput {
	psbt: Psbt;
	addressType: TAddressType;
	keyPair: BIP32Interface;
	utxo: IUtxo;
	selectedNetwork?: TAvailableNetworks;
}
export const addInput = async ({
	psbt,
	addressType,
	keyPair,
	utxo,
	selectedNetwork,
}: IAddInput): Promise<Result<string>> => {
	try {
		if (!selectedNetwork) {
			selectedNetwork = getSelectedNetwork();
		}
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

/**
 * Returns total value of all outputs. Excludes any value that would be sent to the change address.
 * @param selectedWallet
 * @param selectedNetwork
 * @param outputs
 * @param includeChangeAddress
 */
export const getTransactionOutputValue = ({
	selectedWallet = undefined,
	selectedNetwork = undefined,
	outputs = undefined,
}: {
	selectedWallet?: string | undefined;
	selectedNetwork?: TAvailableNetworks | undefined;
	outputs?: undefined | IOutput[];
}): number => {
	try {
		if (!outputs) {
			if (!selectedWallet) {
				selectedWallet = getSelectedWallet();
			}
			if (!selectedNetwork) {
				selectedNetwork = getSelectedNetwork();
			}
			const transaction = getOnchainTransactionData({
				selectedWallet,
				selectedNetwork,
			});
			if (transaction.isErr()) {
				return 0;
			}
			outputs = transaction.value.outputs || [];
		}
		if (outputs) {
			const response = reduceValue({ arr: outputs, value: 'value' });
			if (response.isOk()) {
				return response.value;
			}
		}
		return 0;
	} catch (e) {
		return 0;
	}
};

/**
 * Returns total value of all utxos.
 * @param selectedWallet
 * @param selectedNetwork
 * @param utxos
 */
export const getTransactionUtxoValue = ({
	selectedWallet = undefined,
	selectedNetwork = undefined,
	utxos = undefined,
}: {
	selectedWallet: string | undefined;
	selectedNetwork: TAvailableNetworks | undefined;
	utxos?: IUtxo[] | undefined;
}): number => {
	try {
		if (!utxos) {
			if (!selectedWallet) {
				selectedWallet = getSelectedWallet();
			}
			if (!selectedNetwork) {
				selectedNetwork = getSelectedNetwork();
			}
			const transaction = getOnchainTransactionData({
				selectedWallet,
				selectedNetwork,
			});
			if (transaction.isErr()) {
				return 0;
			}
			utxos = transaction.value.utxos;
		}
		if (utxos) {
			const response = reduceValue({ arr: utxos, value: 'value' });
			if (response.isOk()) {
				return response.value;
			}
		}
		return 0;
	} catch (e) {
		return 0;
	}
};

/**
 * Updates the fee for the current transaction by the specified amount.
 * @param {number} [satsPerByte]
 * @param {string | undefined} [selectedWallet]
 * @param {TAvailableNetworks | undefined} [selectedNetwork]
 */
export const updateFee = ({
	satsPerByte = 1,
	selectedWallet = undefined,
	selectedNetwork = undefined,
}: {
	satsPerByte?: number;
	selectedWallet?: string | undefined;
	selectedNetwork?: TAvailableNetworks | undefined;
}): void => {
	if (!satsPerByte || satsPerByte < 1) {
		return;
	}
	if (!selectedWallet) {
		selectedWallet = getSelectedWallet();
	}
	if (!selectedNetwork) {
		selectedNetwork = getSelectedNetwork();
	}
	const wallet = getStore().wallet.wallets[selectedWallet];
	const transaction =
		wallet?.transaction[selectedNetwork] || defaultOnChainTransactionData;
	const previousSatsPerByte = transaction?.satsPerByte;
	//Return if no update needs to be applied.
	if (previousSatsPerByte === satsPerByte) {
		return;
	}
	const balance = wallet?.balance[selectedNetwork];

	const newFee = getTotalFee({ satsPerByte });
	//Return if the new fee exceeds half of the user's balance
	if (Number(newFee) >= balance / 2) {
		return;
	}
	const totalTransactionValue = getTransactionOutputValue({
		selectedWallet,
		selectedNetwork,
	});
	const newTotalAmount = Number(totalTransactionValue) + Number(newFee);
	const _transaction: IOnChainTransactionData = {
		satsPerByte,
		fee: newFee,
	};
	if (newTotalAmount <= balance) {
		updateOnChainTransaction({
			selectedNetwork,
			selectedWallet,
			transaction: _transaction,
		}).then();
	}
};

/**
 * Returns a block explorer URL for a specific transaction
 * @param id
 * @param selectedNetwork
 */
export const getBlockExplorerLink = (
	id: string,
	selectedNetwork: TAvailableNetworks | undefined = undefined,
): string => {
	if (!selectedNetwork) {
		selectedNetwork = getSelectedNetwork();
	}

	if (selectedNetwork === 'bitcoinTestnet') {
		return `https://blockstream.info/testnet/tx/${id}`;
	} else {
		return `https://blockstream.info/tx/${id}`;
	}
};
