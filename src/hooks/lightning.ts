import { useSelector } from 'react-redux';
import Store from '../store/types';
import { TChannel } from '@synonymdev/react-native-ldk';
import { TUseChannelBalance } from '../store/types/lightning';

/**
 * Returns the lightning balance of all known open and pending channels.
 * @param {boolean} [includeReserveBalance] Whether or not to include each channel's reserve balance (~1% per channel participant) in the returned balance.
 * @returns {{ localBalance: number; remoteBalance: number; }}
 */
export const useLightningBalance = (
	includeReserveBalance = true,
): {
	localBalance: number;
	remoteBalance: number;
} => {
	const selectedWallet = useSelector(
		(store: Store) => store.wallet.selectedWallet,
	);
	const selectedNetwork = useSelector(
		(store: Store) => store.wallet.selectedNetwork,
	);
	const openChannelIds = useSelector(
		(store: Store) =>
			store.lightning.nodes[selectedWallet].openChannelIds[selectedNetwork],
	);
	const channels = useSelector(
		(store: Store) =>
			store.lightning.nodes[selectedWallet].channels[selectedNetwork],
	);

	const openChannels = openChannelIds.filter((channelId) => {
		const channel = channels[channelId];
		return channel?.short_channel_id;
	});

	const localBalance = Object.values(channels).reduce((acc, cur) => {
		if (openChannels.includes(cur.channel_id)) {
			if (!includeReserveBalance) {
				return acc + Number(cur.outbound_capacity_sat);
			} else {
				return (
					acc +
					Number(cur.outbound_capacity_sat) +
					Number(cur.unspendable_punishment_reserve)
				);
			}
		}
		return acc;
	}, 0);

	const remoteBalance = Object.values(channels).reduce((acc, cur) => {
		if (openChannelIds.includes(cur.channel_id)) {
			if (!includeReserveBalance) {
				return acc + Number(cur.inbound_capacity_sat);
			} else {
				return (
					acc +
					Number(cur.inbound_capacity_sat) +
					Number(cur.unspendable_punishment_reserve)
				);
			}
		}
		return acc;
	}, 0);

	return { localBalance, remoteBalance };
};

/**
 * Returns channel balance information for a given channelId.
 * @param {string} channelId
 * @returns {TUseChannelBalance}
 */
export const useLightningChannelBalance = (channelId): TUseChannelBalance => {
	const selectedWallet = useSelector(
		(store: Store) => store.wallet.selectedWallet,
	);
	const selectedNetwork = useSelector(
		(store: Store) => store.wallet.selectedNetwork,
	);

	const channel: TChannel = useSelector(
		(store: Store) =>
			store.lightning.nodes[selectedWallet].channels[selectedNetwork][
				channelId
			],
	);
	const spendingTotal =
		channel.channel_value_satoshis +
		(channel?.unspendable_punishment_reserve ?? 0);
	const spendingAvailable = channel.outbound_capacity_sat;
	const receivingTotal =
		channel.channel_value_satoshis -
		channel.balance_sat +
		(channel?.unspendable_punishment_reserve ?? 0);
	const receivingAvailable = channel.inbound_capacity_sat;
	const capacity = channel.channel_value_satoshis;

	return {
		spendingTotal, // How many sats the user has reserved in the channel. (Outbound capacity + Punishment Reserve)
		spendingAvailable, // How much the user is able to spend from a channel. (Outbound capacity - Punishment Reserve)
		receivingTotal, // How many sats the counterparty has reserved in the channel. (Inbound capacity + Punishment Reserve)
		receivingAvailable, // How many sats the user is able to receive in a channel. (Inbound capacity - Punishment Reserve)
		capacity, // Total capacity of the channel. (spendingTotal + receivingTotal)
	};
};

/**
 * Returns the name of a channel given its channelId.
 * @param {string} channelId
 * @returns {string}
 */
export const useLightningChannelName = (channelId): string => {
	const selectedWallet = useSelector(
		(store: Store) => store.wallet.selectedWallet,
	);
	const selectedNetwork = useSelector(
		(store: Store) => store.wallet.selectedNetwork,
	);

	const channel = useSelector(
		(store: Store) =>
			store.lightning.nodes[selectedWallet].channels[selectedNetwork][
				channelId
			],
	);

	return channel?.inbound_scid_alias ?? channel?.short_channel_id
		? channel?.short_channel_id
		: channel?.channel_id ?? 'Unknown Channel';
};

/**
 * Returns channel data for the provided channelId.
 * @param {string} channelId
 * @returns {TChannel}
 */
export const useLightningChannelData = (channelId): TChannel => {
	const selectedWallet = useSelector(
		(store: Store) => store.wallet.selectedWallet,
	);
	const selectedNetwork = useSelector(
		(store: Store) => store.wallet.selectedNetwork,
	);

	return useSelector(
		(store: Store) =>
			store.lightning.nodes[selectedWallet].channels[selectedNetwork][
				channelId
			],
	);
};
