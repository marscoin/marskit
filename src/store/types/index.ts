import { IUser } from "./user";
import { IWallet } from "./wallet";
import { ISettings } from "./settings";
import { IOmniBolt } from "./omnibolt";
import { ILightning } from "./lightning";

export default interface Store {
    user: IUser,
    wallet: IWallet,
    omnibolt: IOmniBolt,
    settings: ISettings,
    lightning: ILightning
}
