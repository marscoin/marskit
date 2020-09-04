import { combineReducers } from "redux";
import user from "./user";
import wallet from "./wallet";
import settings from "./settings";

const appReducers = combineReducers({
	user,
	wallet,
	settings
});

export default appReducers;
