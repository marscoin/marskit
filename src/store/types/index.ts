import { IUser } from "./user";
import { IWallet } from "./wallet";
import { ISettings } from "./settings";

export default interface Store {
    user: IUser,
    wallet: IWallet,
    settings: ISettings
}
