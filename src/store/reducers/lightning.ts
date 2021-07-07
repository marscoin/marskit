import actions from '../actions/actions';
import { ILightning } from '../types/lightning';
import { defaultLightningShape } from '../shapes/lightning';
import { lnrpc } from '@synonymdev/react-native-lightning';

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
				info: lnrpc.GetInfoResponse.create({ syncedToChain: false }), //As they just unlocked rather assume they're not in sync
			};
		case actions.RESET_LIGHTNING_STORE:
		case actions.WIPE_WALLET:
			return { ...defaultLightningShape };
		case actions.UPDATE_LIGHTNING_CACHED_NEUTRINO:
			return {
				...state,
				cachedNeutrinoDBDownloadState: {
					...state.cachedNeutrinoDBDownloadState,
					...action.payload,
				},
			};
		default:
			return {
				...defaultLightningShape,
				...state,
			};
	}
};

export default lightning;
