import { combineReducers } from "redux";
import user from "./user";
import wallet from "./wallet";
import omnibolt from "./omnibolt";
import settings from "./settings";
import lightning from "./lightning";

const appReducers = combineReducers({
	user,
	wallet,
	omnibolt,
	settings,
	lightning
});

export default appReducers;
