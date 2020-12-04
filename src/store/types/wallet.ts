import { AvailableNetworks } from "../../utils/networks";

export interface IWallet {
    loading: boolean;
    error: boolean;
    selectedNetwork: AvailableNetworks;
    selectedWallet: string;
    wallets: object;
    [key: string]: any;
}
