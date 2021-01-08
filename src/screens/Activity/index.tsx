import React, { memo, ReactElement, useState } from 'react';
import {
	Text,
	TouchableOpacity,
	View,
	RefreshControl,
} from '../../styles/components';
import NavigationHeader from '../../components/NavigationHeader';
import { FlatList, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import Store from '../../store/types';
import { IActivityItem } from '../../store/types/activity';
import { refreshWallet } from '../../utils/wallet';
import { refreshLightningTransactions } from '../../store/actions/lightning';

const ListItem = ({
	item,
	onPress,
}: {
	item: IActivityItem;
	onPress: () => void;
}): ReactElement => {
	const {
		description,
		value,
		activityType,
		txType,
		confirmed,
		timestamp,
	} = item;

	return (
		<TouchableOpacity style={styles.item} onPress={onPress}>
			<View>
				<Text>
					{activityType} - {txType}
				</Text>
				<Text>{description}</Text>
				<Text>Date: {new Date(timestamp).toString()}</Text>
			</View>
			<View>
				<Text>{value}</Text>
				<Text>{confirmed ? '✅' : '⌛'}</Text>
			</View>
		</TouchableOpacity>
	);
};

const ActivityScreen = ({ navigation }): ReactElement => {
	const activity = useSelector((state: Store) => state.activity);
	const [refreshing, setRefreshing] = useState(false);

	const renderItem = ({ item }): ReactElement => {
		return (
			<ListItem
				key={item.id}
				item={item}
				onPress={(): void =>
					navigation.navigate('ActivityDetail', { activityItem: item })
				}
			/>
		);
	};

	const onRefresh = async (): Promise<void> => {
		setRefreshing(true);
		//Refresh wallet and lightning transactions
		await Promise.all([refreshWallet(), refreshLightningTransactions()]);
		setRefreshing(false);
	};

	return (
		<View style={styles.container}>
			<NavigationHeader title="Activity" isHome={true} />
			<FlatList
				data={activity.items}
				renderItem={renderItem}
				keyExtractor={(item): string => item.id}
				refreshControl={
					<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
				}
			/>
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

export default memo(ActivityScreen);
