import actions from '../actions/actions';
import { IOmniBolt } from '../types/omnibolt';
import { defaultOmniBoltShape } from '../shapes/omnibolt';

let selectedWallet = '';
let selectedNetwork = '';

const omnibolt = (state = defaultOmniBoltShape, action): IOmniBolt => {
	if (action.payload?.selectedWallet) {
		selectedWallet = action.payload.selectedWallet;
	}
	if (action.payload?.selectedNetwork) {
		selectedNetwork = action.payload.selectedNetwork;
	}
	switch (action.type) {
		case actions.UPDATE_OMNIBOLT:
			return {
				...state,
				...action.payload,
			};

		case actions.CREATE_OMNIBOLT_WALLET:
			return {
				...state,
				wallets: {
					...state.wallets,
					...action.payload,
				},
			};

		case actions.UPDATE_OMNIBOLT_USERDATA:
			if (!selectedWallet || !selectedNetwork) {
				return state;
			}
			return {
				...state,
				wallets: {
					...state.wallets,
					[selectedWallet]: {
						...state.wallets[selectedWallet],
						userData: {
							...state.wallets[selectedWallet].userData,
							[selectedNetwork]: {
								...state.wallets[selectedWallet].userData[selectedNetwork],
								...action.payload,
							},
						},
					},
				},
			};

		case actions.UPDATE_OMNIBOLT_CONNECTDATA:
			if (!selectedWallet || !selectedNetwork) {
				return state;
			}
			return {
				...state,
				wallets: {
					...state.wallets,
					[selectedWallet]: {
						...state.wallets[selectedWallet],
						connectData: {
							...state.wallets[selectedWallet].connectData[selectedNetwork],
							[selectedNetwork]: action.payload.data,
						},
					},
				},
			};

		case actions.UPDATE_OMNIBOLT_CHANNELS:
			if (!selectedWallet || !selectedNetwork) {
				return state;
			}
			return {
				...state,
				wallets: {
					...state.wallets,
					[selectedWallet]: {
						...state.wallets[selectedWallet],
						channels: {
							...state.wallets[selectedWallet].channels[selectedNetwork],
							[selectedNetwork]: action.payload.channels,
						},
						tempChannels: {
							...state.wallets[selectedWallet]?.tempChannels[selectedNetwork],
							[selectedNetwork]: action.payload.tempChannels,
						},
						checkpoints: {
							...state.wallets[selectedWallet]?.checkpoints[selectedNetwork],
							[selectedNetwork]: action.payload.checkpoints,
						},
					},
				},
			};

		case actions.UPDATE_OMNIBOLT_PEERS:
			if (!selectedWallet || !selectedNetwork) {
				return state;
			}
			return {
				...state,
				wallets: {
					...state.wallets,
					[selectedWallet]: {
						...state.wallets[selectedWallet],
						peers: {
							...state.wallets[selectedWallet].peers[selectedNetwork],
							[selectedNetwork]: action.payload.data,
						},
					},
				},
			};

		case actions.RESET_OMNIBOLT_STORE:
		case actions.WIPE_WALLET:
			return { ...defaultOmniBoltShape };

		default:
			return state;
	}
};

export default omnibolt;
