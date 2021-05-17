import React, { memo, ReactElement, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
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
} from '../../../utils/lightning';
import { useSelector } from 'react-redux';
import Store from '../../../store/types';

const LightningInfo = ({ navigation }): ReactElement => {
	const lightning = useSelector((state: Store) => state.lightning);
	const [content, setContent] = useState<string>('');

	const SettingsListData = [
		{
			title: 'LND debug commands',
			data: [
				{
					title: 'Show Info',
					type: 'button',
					onPress: async (): Promise<void> => {
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
						} = lightning.info;

						let output = `Version: ${version}`;
						output += `\n\nSynced: ${syncedToChain ? '✅' : '❌'}`;
						output += `\n\nBlock Height: ${blockHeight}`;
						output += `\n\nIdentity Pubkey: ${identityPubkey}`;
						output += `\n\nAlias: ${alias}`;
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
					onPress: async (): Promise<void> => await debugGetBalance(setContent),
					hide: false,
				},
				{
					title: 'List peers',
					type: 'button',
					onPress: async (): Promise<void> => await debugListPeers(setContent),
					hide: false,
				},
				{
					title: 'Connect to default peer',
					type: 'button',
					onPress: async (): Promise<void> => {
						const res = await connectToDefaultPeer();
						if (res.isErr()) {
							return setContent(res.error.message);
						}

						setContent(JSON.stringify(res.value));
					},
					hide: false,
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
