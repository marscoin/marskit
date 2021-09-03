import { combineReducers } from 'redux';
import user from './user';
import wallet from './wallet';
import omnibolt from './omnibolt';
import settings from './settings';
import lightning from './lightning';
import activity from './activity';
import backup from './backup';
import chainreactor from './chainreactor';
import todos from './todos';

const appReducers = combineReducers({
	user,
	wallet,
	omnibolt,
	settings,
	lightning,
	activity,
	backup,
	chainreactor,
	todos,
});

export default appReducers;
