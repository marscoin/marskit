import { combineReducers } from "redux";
import user from "./user";
import wallet from "./wallet";
import omnibolt from "./omnibolt";
import settings from "./settings";

const appReducers = combineReducers({
	user,
	wallet,
	omnibolt,
	settings
});

export default appReducers;
