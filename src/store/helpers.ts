import store from "../store";
import Store from "./types";
import { Dispatch } from "redux";

/*
Used to retrieve the store outside of a component.
 */
export const getStore = (): Store => store.getState();

/*
Used to get dispatch outside of a component.
 */
export const getDispatch = (): Dispatch<any> => store.dispatch;
