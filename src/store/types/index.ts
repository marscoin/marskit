import { IUser } from './user';
import { IWallet } from './wallet';
import { ISettings } from './settings';
import { IOmniBolt } from './omnibolt';
import { ILightning } from './lightning';
import { IActivity } from './activity';
import { IBackup } from './backup';
import { IBlocktank } from './blocktank';
import { ITodos } from './todos';
import { IFees } from './fees';

export default interface Store {
	user: IUser;
	wallet: IWallet;
	omnibolt: IOmniBolt;
	settings: ISettings;
	lightning: ILightning;
	activity: IActivity;
	backup: IBackup;
	blocktank: IBlocktank;
	todos: ITodos;
	fees: IFees;
}
