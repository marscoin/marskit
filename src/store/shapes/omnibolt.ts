import { EOmniBoltUserData, IOmniBolt } from '../types/omnibolt';
import { EWallet } from '../types/wallet';

export const defaultOmniBoltShape: IOmniBolt = {
	loading: false,
	error: false,
	selectedNetwork: EWallet.selectedNetwork,
	selectedWallet: EWallet.defaultWallet,
	userData: EOmniBoltUserData,
};
