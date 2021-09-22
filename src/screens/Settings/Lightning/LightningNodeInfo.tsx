import React, { memo, ReactElement } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import {
	View,
	Feather,
	Text,
	TouchableOpacity,
} from '../../../styles/components';
import { useSelector } from 'react-redux';
import Store from '../../../store/types';
import lnd from '@synonymdev/react-native-lightning';
import SafeAreaView from '../../../components/SafeAreaView';

const LightningNodeInfo = ({ navigation }): ReactElement => {
	const lightning = useSelector((state: Store) => state.lightning);

	const { state, info } = lightning;

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
		numPendingChannels,
	} = info;

	let output = [['Version', version]];
	output.push(['State', lnd.stateService.readableState(state)]);
	output.push(['Synced', `${syncedToChain ? '✅' : '❌'}`]);
	output.push(['Block Height', blockHeight.toString()]);
	output.push(['Identity Pubkey', identityPubkey]);
	output.push(['Alias', alias]);
	output.push(['Active Channels', numActiveChannels.toString()]);
	output.push(['Inactive Channels', numInactiveChannels.toString()]);
	output.push(['Pending Channels', numPendingChannels.toString()]);
	output.push(['Peers', numPeers.toString()]);
	output.push(['Network', `${chains[0].network}`]);

	return (
		<SafeAreaView>
			<TouchableOpacity
				activeOpacity={0.7}
				onPress={navigation.goBack}
				style={styles.row}>
				<Feather style={{}} name="arrow-left" size={30} />
				<Text style={styles.backText}>Lightning node info</Text>
			</TouchableOpacity>
			<ScrollView>
				<View style={styles.info}>
					{output.map(([title, value]) => (
						<View style={styles.item} key={title}>
							<Text style={styles.itemTitle}>{title}:</Text>
							<Text style={styles.itemValue}>{value}</Text>
						</View>
					))}
				</View>
			</ScrollView>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	row: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingLeft: 10,
		paddingVertical: 8,
	},
	backText: {
		fontSize: 20,
	},
	info: {
		margin: 20,
		textAlign: 'center',
	},
	item: {
		marginBottom: 20,
	},
	itemTitle: {
		fontWeight: 'bold',
		fontSize: 16,
	},
	itemValue: {
		fontWeight: '300',
		marginTop: 5,
		fontSize: 14,
	},
});

export default memo(LightningNodeInfo);
