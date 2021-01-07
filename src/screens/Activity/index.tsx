import React, { memo, ReactElement } from 'react';
import { Text, TouchableOpacity, View } from '../../styles/components';
import NavigationHeader from '../../components/NavigationHeader';
import { FlatList, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import Store from '../../store/types';
import { IActivityItem } from '../../store/types/activity';

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
		timestampUtc,
	} = item;

	return (
		<TouchableOpacity style={styles.item} onPress={onPress}>
			<View>
				<Text>
					{activityType} - {txType}
				</Text>
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

const ActivityScreen = ({ navigation }): ReactElement => {
	const activity = useSelector((state: Store) => state.activity);

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

	return (
		<View style={styles.container}>
			<NavigationHeader title="Activity" isHome={true} />
			<FlatList
				data={activity.items}
				renderItem={renderItem}
				keyExtractor={(item): string => '123' + item.id}
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
