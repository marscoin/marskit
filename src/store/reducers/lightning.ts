import actions from '../actions/actions';
import { ILightning } from '../types/lightning';
import { defaultLightningShape } from '../shapes/lightning';
import { lnrpc } from 'react-native-lightning/dist/rpc';

const lightning = (state: ILightning, action): ILightning => {
	switch (action.type) {
		case actions.UPDATE_LIGHTNING_STATE:
			return {
				...state,
				state: action.payload,
			};
		case actions.UPDATE_LIGHTNING_INFO:
			return {
				...state,
				info: action.payload,
			};
		case actions.UPDATE_LIGHTNING_ON_CHAIN_BALANCE:
			return {
				...state,
				onChainBalance: action.payload,
			};
		case actions.UPDATE_LIGHTNING_CHANNEL_BALANCE:
			return {
				...state,
				channelBalance: action.payload,
			};
		case actions.UPDATE_LIGHTNING_INVOICES:
			return {
				...state,
				invoiceList: action.payload,
			};
		case actions.UPDATE_LIGHTNING_PAYMENTS:
			return {
				...state,
				paymentList: action.payload,
			};
		case actions.CREATE_LIGHTNING_WALLET:
			return {
				...state,
				...defaultLightningShape,
			};
		case actions.UNLOCK_LIGHTNING_WALLET:
			return {
				...state,
				info: lnrpc.GetInfoResponse.create({ syncedToChain: false }), //As they just unlocked rather assume they're not in sync //lnrpc.GetInfoResponse.create({ syncedToChain: false })
			};
		default:
			return {
				...defaultLightningShape,
				...state,
			};
	}
};

export default lightning;
