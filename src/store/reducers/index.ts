import { combineReducers } from 'redux';
import user from './user';
import wallet from './wallet';
import omnibolt from './omnibolt';
import settings from './settings';
import lightning from './lightning';
import activity from './activity';
import backup from './backup';

const appReducers = combineReducers({
	user,
	wallet,
	omnibolt,
	settings,
	lightning,
	activity,
	backup,
});

export default appReducers;
