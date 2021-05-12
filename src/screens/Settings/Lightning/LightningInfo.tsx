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
	defaultNodePubKey,
} from '../../../utils/lightning';
import { useSelector } from 'react-redux';
import Store from '../../../store/types';
import lnd, {
	ENetworks as LndNetworks,
	TLndConf,
	lnrpc,
} from 'react-native-lightning';
import { bytesToString } from '../../../utils/converters';

const LightningInfo = ({ navigation }): ReactElement => {
	const lightning = useSelector((state: Store) => state.lightning);

	const [content, setContent] = useState<string>('');
	const [pendingChanId, setPendingChanId] = useState(new Uint8Array(0));

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
				{
					title: 'Move on-chain wallet funds to lightning',
					type: 'button',
					onPress: async (): Promise<void> => {
						setContent('Opening...');
						const channelId = lnd.openChannelStream(
							123456,
							defaultNodePubKey,
							'bcrt1qll79gp5avu90rhg4x67yh6avsej9tcpeg5j0kw', //TODO use on chain wallet address
							(res) => {
								if (res.isErr()) {
									return setContent(`Stream error: ${res.error.message}`);
								}

								setContent('STREAM UPDATE: ' + JSON.stringify(res.value));

								const { psbtFund } = res.value;

								console.warn(JSON.stringify(res.value));
							},
							() => {
								setContent('Channel funded.');
							},
						);

						setPendingChanId(channelId);
					},
					hide: false,
				},
				{
					title: 'Fund it',
					type: 'button',
					onPress: async (): Promise<void> => {
						if (pendingChanId.length === 0) {
							return alert('No pending channel ID');
						}

						setContent('Funding...');

						const psbt =
							'cHNidP8BAKYCAAAAAqJ9l2KCY1w1TrtG5cf34QWt1xibVBhrgOgKl8+fdsmDAAAAAAAAAAAA1ec3g3uzouINR9rlAwPzix5BVYSeluDdkP16vB3vJ2kAAAAAAAAAAAACQOIBAAAAAAAiACBUjq4HEBbKBcpE8A9aXYBCI9DvdjT6HQN4m8ZDom+yGBYmAAAAAAAAFgAU6xCnBnbmAnC9aC74g/e63H0Q5AwAAAAAAAEBH0DiAQAAAAAAFgAUxWvNG3unTlkIvC+cRsjX1AIaQG8AAQEfECcAAAAAAAAWABSw+p92qXRnyiP0oWuaiGnYHZThLAAAAA==';
						await lnd.fundingStateStep(pendingChanId, psbt, 'verify');
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
