import { combineReducers } from 'redux';
import user from './user';
import wallet from './wallet';
import settings from './settings';
import lightning from './lightning';
import activity from './activity';
import backup from './backup';
import blocktank from './blocktank';
import todos from './todos';
import fees from './fees';

const appReducers = combineReducers({
	user,
	wallet,
	settings,
	lightning,
	activity,
	backup,
	blocktank,
	todos,
	fees,
});

export default appReducers;
