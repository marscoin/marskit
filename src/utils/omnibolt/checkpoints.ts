import { ICheckpoint } from '../../store/shapes/omnibolt';
import {
	onChannelOpenAttempt,
	onBitcoinFundingCreated,
	onAssetFundingCreated,
	sendSignedHex101035,
	onCommitmentTransactionCreated,
	commitmentTransactionAccepted,
	on110353,
	ICommitmentTransactionAcceptedCheckpointData,
	on110352,
	sendSignedHex100363,
} from './index';
import {
	TOnChannelOpenAttempt,
	TOnBitcoinFundingCreated,
	TOnAssetFundingCreated,
	IAssetFundingSigned,
	TOn110353,
	TOn110352,
} from 'omnibolt-js/lib/types/types';
import { getStore } from '../../store/helpers';
import { getSelectedNetwork, getSelectedWallet } from '../wallet';

export const resumeFromCheckpoints = async (): Promise<void> => {
	const selectedWallet = getSelectedWallet();
	const selectedNetwork = getSelectedNetwork();
	const checkpoints: ICheckpoint =
		getStore().omnibolt.wallets[selectedWallet].checkpoints[selectedNetwork];
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
				case 'commitmentTransactionAccepted':
					const commitmentTransactionAcceptedData: ICommitmentTransactionAcceptedCheckpointData =
						checkpoints[channelId].data;
					commitmentTransactionAccepted(
						commitmentTransactionAcceptedData,
					).then();
					break;
				case 'on110352':
					const on110352Data: TOn110352 = checkpoints[channelId].data;
					on110352(on110352Data).then();
					break;
				case 'on110353':
					const on110353Data: TOn110353 = checkpoints[channelId].data;
					on110353(on110353Data).then();
					break;
				case 'sendSignedHex100363':
					const sendSignedHex100363Data = checkpoints[channelId].data;
					sendSignedHex100363(sendSignedHex100363Data).then();
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
