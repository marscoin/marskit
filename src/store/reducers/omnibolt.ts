import actions from '../actions/actions';
import { IOmniBolt } from '../types/omnibolt';
import { channelContent, defaultOmniBoltShape } from '../shapes/omnibolt';

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
								...action.payload.userData,
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
							...state.wallets[selectedWallet].channels,
							[selectedNetwork]: action.payload.channels,
						},
						tempChannels: {
							...state.wallets[selectedWallet]?.tempChannels,
							[selectedNetwork]: action.payload.tempChannels,
						},
					},
				},
			};

		case actions.UPDATE_OMNIBOLT_CHECKPOINT:
			if (!selectedWallet || !selectedNetwork) {
				return state;
			}
			return {
				...state,
				wallets: {
					...state.wallets,
					[selectedWallet]: {
						...state.wallets[selectedWallet],
						checkpoints: {
							...state.wallets[selectedWallet]?.checkpoints,
							[selectedNetwork]: {
								...state.wallets[selectedWallet]?.checkpoints[selectedNetwork],
								[action.payload.channelId]: {
									checkpoint: action.payload.checkpoint,
									data: action.payload.data,
								},
							},
						},
					},
				},
			};

		case actions.UPDATE_OMNIBOLT_CHANNEL_ADDRESS:
			if (!selectedWallet || !selectedNetwork) {
				return state;
			}
			return {
				...state,
				wallets: {
					...state.wallets,
					[selectedWallet]: {
						...state.wallets[selectedWallet],
						channelAddresses: {
							...state.wallets[selectedWallet]?.channelAddresses,
							[selectedNetwork]: {
								...state.wallets[selectedWallet]?.channelAddresses[
									selectedNetwork
								],
								[action.payload.channelId]: {
									...channelContent,
									[action.payload.channelAddressId]:
										action.payload.channelAddress,
								},
							},
						},
					},
				},
			};

		case actions.UPDATE_OMNIBOLT_CHANNEL_ADDRESSES_KEY:
			if (!selectedWallet || !selectedNetwork) {
				return state;
			}
			return {
				...state,
				wallets: {
					...state.wallets,
					[selectedWallet]: {
						...state.wallets[selectedWallet],
						channelAddresses: {
							...state.wallets[selectedWallet]?.channelAddresses,
							[selectedNetwork]: action.payload.channelAddresses,
						},
					},
				},
			};

		case actions.CLEAR_OMNIBOLT_CHECKPOINT:
			if (!selectedWallet || !selectedNetwork) {
				return state;
			}
			return {
				...state,
				wallets: {
					...state.wallets,
					[selectedWallet]: {
						...state.wallets[selectedWallet],
						checkpoints: {
							...state.wallets[selectedWallet]?.checkpoints,
							[selectedNetwork]: {
								...action.payload.checkpoints,
							},
						},
					},
				},
			};

		case actions.ADD_OMNIBOLT_ADDRESS:
			if (!selectedWallet || !selectedNetwork) {
				return state;
			}
			return {
				...state,
				wallets: {
					...state.wallets,
					[selectedWallet]: {
						...state.wallets[selectedWallet],
						addressIndex: {
							...state.wallets[selectedWallet].addressIndex,
							[selectedNetwork]: {
								...state.wallets[selectedWallet].addressIndex[selectedNetwork],
								...action.payload,
							},
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
