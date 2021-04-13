import { ICheckpoint } from '../../store/shapes/omnibolt';
import {
	onChannelOpenAttempt,
	onBitcoinFundingCreated,
	onAssetFundingCreated,
	sendSignedHex101035,
	onCommitmentTransactionCreated,
} from './index';
import {
	TOnChannelOpenAttempt,
	TOnBitcoinFundingCreated,
	TOnAssetFundingCreated,
	IAssetFundingSigned,
} from 'omnibolt-js/lib/types/types';
import { getStore } from '../../store/helpers';
import { getSelectedNetwork, getSelectedWallet } from '../wallet';

export const resumeFromCheckpoints = async (): Promise<void> => {
	const selectedWallet = getSelectedWallet();
	const selectedNetwork = getSelectedNetwork();
	const checkpoints: ICheckpoint = getStore().omnibolt.wallets[selectedWallet]
		.checkpoints[selectedNetwork];
	await Promise.all(
		Object.keys(checkpoints).map((channelId): void => {
			const id = checkpoints[channelId].checkpoint;
			switch (id) {
				case 'onChannelOpenAttempt':
					const onChannelOpenAttemptData: TOnChannelOpenAttempt =
						checkpoints[channelId].data;
					onChannelOpenAttempt(onChannelOpenAttemptData).then();
					break;
				case 'onBitcoinFundingCreated':
					const onBitcoinFundingCreatedData: TOnBitcoinFundingCreated =
						checkpoints[channelId].data;
					onBitcoinFundingCreated({
						data: onBitcoinFundingCreatedData,
					}).then();
					break;
				case 'onAssetFundingCreated':
					const onAssetFundingCreatedData: TOnAssetFundingCreated =
						checkpoints[channelId].data;
					onAssetFundingCreated({
						data: onAssetFundingCreatedData,
					}).then();
					break;
				case 'sendSignedHex101035':
					const sendSignedHex101035Data: {
						funder_node_address: string;
						funder_peer_id: string;
						result: IAssetFundingSigned;
					} = checkpoints[channelId].data;
					sendSignedHex101035({
						funder_node_address: sendSignedHex101035Data.funder_node_address,
						funder_peer_id: sendSignedHex101035Data.funder_peer_id,
						data: sendSignedHex101035Data.result,
						channelId,
					});
					break;
				case 'onCommitmentTransactionCreated':
					onCommitmentTransactionCreated({
						data: checkpoints[channelId].data,
						channelId,
					});
					break;
			}
		}),
	);
};
