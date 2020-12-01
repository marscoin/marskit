type SelectedNetwork = "bitcoin" | "bitcoinTestnet";

export interface IWallet {
    loading: boolean;
    error: boolean;
    selectedNetwork: SelectedNetwork;
    selectedWallet: string;
    wallets: object;
    [key: string]: any;
}
