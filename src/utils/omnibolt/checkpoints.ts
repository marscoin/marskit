import { ICheckpoint } from '../../store/shapes/omnibolt';
import { onChannelOpenAttempt } from './index';
import { TOnChannelOpenAttempt } from 'omnibolt-js/lib/types/types';
import { getStore } from '../../store/helpers';
import { getSelectedNetwork, getSelectedWallet } from '../wallet';

export const resumeFromCheckponts = async (): Promise<void> => {
	const selectedWallet = getSelectedWallet();
	const selectedNetwork = getSelectedNetwork();
	const checkpoints: ICheckpoint = getStore().omnibolt.wallets[selectedWallet]
		.checkpoints[selectedNetwork];
	await Promise.all(
		Object.keys(checkpoints).map((channelId): void => {
			const id = checkpoints[channelId].checkpoint;
			switch (id) {
				case 'onChannelOpenAttempt':
					const data: TOnChannelOpenAttempt = checkpoints[channelId].data;
					onChannelOpenAttempt(data).then();
					break;
			}
		}),
	);
};
