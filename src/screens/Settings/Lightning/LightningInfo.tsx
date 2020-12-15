import React, { memo, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import {
	View,
	Feather,
	Text,
	TouchableOpacity,
} from '../../../styles/components';
import List from '../../../components/List';
import {
	connectToPeer,
	copyNewAddressToClipboard,
	getBalance,
	openMaxChannel,
	payInvoice,
} from '../../../utils/lightning';
import { useSelector } from 'react-redux';
import Store from '../../../store/types';

const LightningInfo = ({ navigation }) => {
	const lightning = useSelector((state: Store) => state.lightning);

	const [content, setContent] = useState<string>('');

	const SettingsListData = [
		{
			title: 'LND debug commands',
			data: [
				{
					title: 'Show Info',
					type: 'button',
					onPress: async () => {
						const {
							blockHeight,
							chains,
							identityPubkey,
							numActiveChannels,
							numInactiveChannels,
							numPeers,
							syncedToChain,
							version,
							alias,
							syncedToGraph,
						} = lightning.info;

						let output = `Version: ${version}`;
						output += `\n\nSynced: ${syncedToChain ? '✅' : '❌'}`;
						output += `\n\nBlock Height: ${blockHeight}`;
						output += `\n\nIdentity Pubkey: ${identityPubkey}`;
						output += `\n\nActive Channels: ${numActiveChannels}`;
						output += `\n\nInactive Channels: ${numInactiveChannels}`;
						output += `\n\nPeers: ${numPeers}`;
						output += `\n\nNetwork: ${chains[0].network}`;

						setContent(output);
					},
				},
				{
					title: 'Show all balances',
					type: 'button',
					onPress: () => getBalance(setContent),
				},
				{
					title: 'Copy receive address',
					type: 'button',
					onPress: () => copyNewAddressToClipboard(setContent),
				},
				{
					title: 'Connect to peer',
					type: 'button',
					onPress: () => connectToPeer(setContent),
				},
				{
					title: 'Open channel',
					type: 'button',
					onPress: () => openMaxChannel(setContent),
				},
				{
					title: 'Pay invoice',
					type: 'button',
					onPress: () => payInvoice(setContent),
				},
			],
		},
	];

	return (
		<View style={styles.container}>
			<TouchableOpacity
				activeOpacity={0.7}
				onPress={navigation.goBack}
				style={styles.row}>
				<Feather style={{}} name="arrow-left" size={30} />
				<Text style={styles.backText}>Lightning</Text>
			</TouchableOpacity>
			<List data={SettingsListData} />
			<ScrollView>
				<Text style={styles.debugContent}>{content}</Text>
			</ScrollView>
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

export default memo(LightningInfo);
