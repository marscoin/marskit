import React, { memo, ReactElement, useEffect, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import lnd from '@synonymdev/react-native-lightning';
import {
	View,
	Feather,
	Text,
	TouchableOpacity,
} from '../../../styles/components';
import List from '../../../components/List';
import {
	connectToDefaultPeer,
	debugGetBalance,
	debugListPeers,
	defaultNodePubKey,
} from '../../../utils/lightning';
import { useSelector } from 'react-redux';
import Store from '../../../store/types';
import { showErrorNotification } from '../../../utils/notifications';
import ReactNativeBiometrics from 'react-native-biometrics';
import { IsSensorAvailableResult } from '../../../components/Biometrics';
import { lnrpc } from '@synonymdev/react-native-lightning';
import { truncate } from '../../../utils/helpers';
import useDisplayValues from '../../../utils/exchange-rate/useDisplayValues';

const LightningChannels = ({ navigation }): ReactElement => {
	const lightning = useSelector((state: Store) => state.lightning);
	const [channelList, setChannelList] = useState<lnrpc.IChannel[]>([]);

	const [peerList, setPeerList] = useState<lnrpc.IPeer[]>([]);

	useEffect(() => {
		(async (): Promise<void> => {
			const channelRes = await lnd.listChannels();
			if (channelRes.isErr()) {
				showErrorNotification({
					title: 'Failed to load channels',
					message: channelRes.error.message,
				});
				return;
			}

			setChannelList(
				channelRes.value.channels.sort((a, b) => {
					if (`${a.chanId}` < `${b.chanId}`) {
						return -1;
					}
					if (`${a.chanId}` > `${b.chanId}`) {
						return 1;
					}
					return 0;
				}),
			);

			const peerRes = await lnd.listPeers();
			if (peerRes.isErr()) {
				showErrorNotification({
					title: 'Failed to load peers',
					message: peerRes.error.message,
				});
				return;
			}

			setPeerList(
				peerRes.value.peers.sort((a, b) => {
					if (`${a.pubKey}` < `${b.pubKey}`) {
						return -1;
					}
					if (`${a.pubKey}` > `${b.pubKey}`) {
						return 1;
					}
					return 0;
				}),
			);
		})();
	}, [lightning]);

	const ListData = [
		{
			title: 'Channels',
			data: channelList.map((c) => {
				let title = `${c.chanId}\n`;
				title += c.active ? 'Active ✅' : 'Inactive ❌';

				title += `Can send: ${c.localBalance}`;
				title += `Can receive: ${c.remoteBalance}`;

				return {
					title,
					type: 'button',
					onPress: async (): Promise<void> => {
						//TODO navigate to detail view
					},
					hide: false,
				};
			}),
		},
		{
			title: 'Peers',
			data: peerList.map((p) => ({
				title: `Pubkey: ${truncate(p.pubKey, 20)}${
					p.pubKey === defaultNodePubKey ? ' (Default node)' : ''
				}\nAddress: ${p.address}`,
				type: 'button',
				onPress: async (): Promise<void> => {},
				hide: false,
			})),
		},
	];

	return (
		<View style={styles.container}>
			<TouchableOpacity
				activeOpacity={0.7}
				onPress={navigation.goBack}
				style={styles.row}>
				<Feather style={{}} name="arrow-left" size={30} />
				<Text style={styles.backText}>Lightning channels</Text>
			</TouchableOpacity>
			<List data={ListData} />
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	row: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingLeft: 10,
		paddingVertical: 8,
	},
	backText: {
		fontSize: 20,
	},
	debugContent: {
		textAlign: 'center',
	},
});

export default memo(LightningChannels);
