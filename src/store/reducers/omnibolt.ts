import actions from "../actions/actions";
import {IOmniBolt} from "../types/omnibolt";

const omnibolt = (state: IOmniBolt = {
    loading: false,
    error: false,
    selectedNetwork: "bitcoin",
    selectedWallet: "wallet0",
    wallets: {}
}, action) => {
    switch (action.type) {

        case actions.UPDATE_OMNIBOLT:
            return {
                ...state,
                ...action.payload
            };

        default:
            return state;

    }
};

export default omnibolt;
