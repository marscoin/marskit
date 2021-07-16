import React, { memo, ReactElement, useEffect, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import {
	View,
	Feather,
	Text,
	TouchableOpacity,
} from '../../../styles/components';
import { useSelector } from 'react-redux';
import Store from '../../../store/types';

const LightningNodeInfo = ({ navigation }): ReactElement => {
	const lightning = useSelector((state: Store) => state.lightning);
	const [content, setContent] = useState<string[][]>([]);

	useEffect(() => {
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
		} = lightning.info;

		let output = [['Version', version]];
		output.push(['Synced', `${syncedToChain ? '✅' : '❌'}`]);
		output.push(['Block Height', blockHeight.toString()]);
		output.push(['Identity Pubkey', identityPubkey]);
		output.push(['Alias', alias]);
		output.push(['Active Channels', numActiveChannels.toString()]);
		output.push(['Inactive Channels', numInactiveChannels.toString()]);
		output.push(['Pending Channels', numPendingChannels.toString()]);
		output.push(['Peers', numPeers.toString()]);
		output.push(['Network', `${chains[0].network}`]);

		setContent(output);
	}, []);

	return (
		<View style={styles.container}>
			<TouchableOpacity
				activeOpacity={0.7}
				onPress={navigation.goBack}
				style={styles.row}>
				<Feather style={{}} name="arrow-left" size={30} />
				<Text style={styles.backText}>Lightning node info</Text>
			</TouchableOpacity>
			<ScrollView>
				<View style={styles.info}>
					{content.map(([title, value]) => (
						<View style={styles.item} key={title}>
							<Text style={styles.itemTitle}>{title}:</Text>
							<Text style={styles.itemValue}>{value}</Text>
						</View>
					))}
				</View>
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
