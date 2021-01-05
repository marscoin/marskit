import React, { memo, ReactElement } from 'react';
import { Text, TouchableOpacity, View } from '../../styles/components';
import NavigationHeader from '../../components/NavigationHeader';
import { FlatList, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import Store from '../../store/types';
import { IActivityItem } from '../../store/types/activity';
import { updateLightningInvoice } from '../../store/actions/activity';
import { lnrpc } from 'react-native-lightning/dist/rpc';

const ListItem = ({
	item,
	onPress,
}: {
	item: IActivityItem;
	onPress: () => void;
}): ReactElement => {
	const { description, value, type, confirmed, timestampUtc } = item;

	return (
		<TouchableOpacity style={styles.item} onPress={onPress}>
			<View>
				<Text>{type}</Text>
				<Text>{description}</Text>
				<Text>Date: {new Date(timestampUtc).toString()}</Text>
			</View>
			<View>
				<Text>{value}</Text>
				<Text>{confirmed ? '✅' : '⌛'}</Text>
			</View>
		</TouchableOpacity>
	);
};

const HistoryScreen = ({ navigation }): ReactElement => {
	const activity = useSelector((state: Store) => state.activity);

	const renderItem = ({ item }): ReactElement => {
		return (
			<ListItem
				key={item.id}
				item={item}
				onPress={(): void =>
					navigation.navigate('HistoryDetail', { activityItem: item })
				}
			/>
		);
	};

	return (
		<View style={styles.container}>
			<NavigationHeader title="History" isHome={true} />
			<FlatList
				data={activity.items}
				renderItem={renderItem}
				keyExtractor={(item): string => '123' + item.id}
			/>

			<View>
				<TouchableOpacity
					onPress={async (): Promise<void> => {
						const creationDate = Math.round(new Date().getTime() / 1000);
						const inv: lnrpc.IInvoice = {
							memo: 'Made up invoice',
							rHash: new Uint8Array([1, 2, 3, 4]),
							value: 999,
							settled: creationDate % 2 === 0,
							creationDate,
						};
						await updateLightningInvoice(inv);
					}}>
					<Text>Total: {activity.items.length}</Text>
				</TouchableOpacity>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	item: {
		padding: 10,
		borderColor: 'gray',
		borderBottomWidth: 1,
		display: 'flex',
		flexDirection: 'row',
		justifyContent: 'space-between',
	},
});

export default memo(HistoryScreen);
