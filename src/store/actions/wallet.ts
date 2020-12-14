import actions from "./actions";
import { ICreateWallet } from "../types/wallet";
import {
	generateAddresses,
	generateMnemonic,
	getMnemonicPhrase,
	validateMnemonic
} from "../../utils/wallet";
import { getDispatch, getStore } from "../helpers";
import { setKeychainValue } from "../../utils/helpers";
import { availableNetworks } from "../../utils/networks";
import { defaultWalletShape } from "../shapes/wallet";

const dispatch = getDispatch();

export const updateWallet = payload => dispatch => {
	return new Promise(async resolve => {
		await dispatch({
			type: actions.UPDATE_WALLET,
			payload
		});
		resolve({ error: false, data: "" });
	});
};

export const createWallet = (
	{
		wallet = "wallet0",
		addressAmount = 2,
		changeAddressAmount = 2,
		mnemonic = "",
		keyDerivationPath = "84"
	}: ICreateWallet) => {
	return new Promise(async (resolve) => {
		const failure = (data) => resolve({ error: true, data });
		try {
			const getMnemonicPhraseResponse = await getMnemonicPhrase(wallet);
			const { error, data } = getMnemonicPhraseResponse;
			const { wallets } = getStore().wallet;
			if (!error && data && wallet in wallets) return failure(`Wallet ID, "${wallet}" already exists.`);

			//Generate Mnemonic if none was provided
			if (mnemonic === "") {
				mnemonic = validateMnemonic(data) ? data : await generateMnemonic();
			}
			//if (!validateMnemonic(mnemonic)) return failure("Invalid Mnemonic");
			await setKeychainValue({ key: wallet, value: mnemonic });

			//Generate a set of addresses & changeAddresses for each network.
			const _addresses = {};
			const _changeAddresses = {};
			const networks = availableNetworks();
			await Promise.all(
				networks.map(async (network) => {
					const generatedAddresses = await generateAddresses({
						wallet,
						selectedNetwork: network,
						addressAmount,
						changeAddressAmount,
						keyDerivationPath
					});
					if (generatedAddresses.error) return failure(generatedAddresses.data);
					const { addresses, changeAddresses } = generatedAddresses.data;
					_addresses[network] = addresses;
					_changeAddresses[network] = changeAddresses;
				})
			)
			const payload = {
				[wallet]: {
					...defaultWalletShape,
					addresses: _addresses,
					changeAddresses: _changeAddresses
				}
			};

			await dispatch({
				type: actions.CREATE_WALLET,
				payload
			});

			resolve({ error: false, data: "" });
		} catch (e) {failure(e);}
	});
};
