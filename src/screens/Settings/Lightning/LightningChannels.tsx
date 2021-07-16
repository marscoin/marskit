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

const LightningChannels = ({ navigation }): ReactElement => {
	const lightning = useSelector((state: Store) => state.lightning);
	const [content, setContent] = useState<string>('');

	const ListData = [
		{
			data: [
				{
					title: 'Channel 1',
					type: 'button',
					onPress: async (): Promise<void> => {},
					hide: false,
				},
				{
					title: 'Channel 2',
					type: 'button',
					onPress: async (): Promise<void> => {},
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
				<Text style={styles.backText}>Lightning channels</Text>
			</TouchableOpacity>
			<List data={ListData} />
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

export default memo(LightningChannels);
