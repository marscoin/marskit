import actions from '../actions/actions';
import { IOmniBolt, ISigningData } from '../types/omnibolt';
import { defaultOmniBoltShape } from '../shapes/omnibolt';

let selectedWallet = '';
let selectedNetwork = '';
let signingData: ISigningData | {} = {};

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

		case actions.UPDATE_OMNIBOLT_CHANNEL_SIGNING_DATA:
			if (!selectedWallet || !selectedNetwork) {
				return state;
			}
			try {
				signingData =
					state.wallets[selectedWallet]?.signingData[selectedNetwork][
						action.payload.channelId
					];
			} catch {}
			return {
				...state,
				wallets: {
					...state.wallets,
					[selectedWallet]: {
						...state.wallets[selectedWallet],
						signingData: {
							...state.wallets[selectedWallet]?.signingData,
							[selectedNetwork]: {
								...state.wallets[selectedWallet]?.signingData[selectedNetwork],
								[action.payload.channelId]: {
									...signingData,
									[action.payload.signingDataKey]: action.payload.signingData,
								},
							},
						},
					},
				},
			};

		case actions.SAVE_OMNIBOLT_CHANNEL_SIGNING_DATA:
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
							...state.wallets[selectedWallet]?.addressIndex,
							[selectedNetwork]: action.payload.data.nextAddressIndex,
						},
						signingData: {
							...state.wallets[selectedWallet]?.signingData,
							[selectedNetwork]: action.payload.data.signingData,
						},
						checkpoints: {
							...state.wallets[selectedWallet]?.checkpoints,
							[selectedNetwork]: action.payload.data.checkpoints,
						},
						fundingAddresses: {
							...state.wallets[selectedWallet]?.fundingAddresses,
							[selectedNetwork]: action.payload.data.fundingAddresses,
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
						signingData: {
							...state.wallets[selectedWallet]?.signingData,
							[selectedNetwork]: action.payload.signingData,
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
								...action.payload.data,
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

		case actions.UPDATE_OMNIBOLT_ASSET_DATA:
			return {
				...state,
				assetData: {
					...state.assetData,
					[action.payload.propertyid]: action.payload,
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
