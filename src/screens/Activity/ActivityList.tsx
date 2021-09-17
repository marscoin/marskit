import React, { memo, ReactElement, useCallback, useState } from 'react';
import {
	View,
	TouchableOpacity,
	RefreshControl,
	SentIcon,
	ReceivedIcon,
	Text02S,
	Caption13S,
	Subtitle,
} from '../../styles/components';
import { FlatList, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import Store from '../../store/types';
import { IActivityItem } from '../../store/types/activity';
import { refreshWallet } from '../../utils/wallet';
import { refreshLightningTransactions } from '../../store/actions/lightning';
import { useNavigation } from '@react-navigation/native';

import { updateActivityList } from '../../store/actions/activity';
import useDisplayValues from '../../hooks/displayValues';
import { timeAgo } from '../../utils/helpers';

const ListItem = memo(
	({
		item,
		onPress,
	}: {
		item: IActivityItem;
		onPress: () => void;
	}): ReactElement => {
		const { value, txType, confirmed, timestamp } = item;

		const { bitcoinFormatted, bitcoinSymbol, fiatFormatted, fiatSymbol } =
			useDisplayValues(value);

		return (
			<TouchableOpacity style={styles.item} onPress={onPress}>
				<View style={styles.col1} color={'transparent'}>
					<View color={'gray6'} style={styles.iconCircle}>
						{txType === 'sent' ? <SentIcon /> : <ReceivedIcon />}
					</View>
					<View color={'transparent'}>
						<Text02S style={styles.note}>
							{txType === 'sent' ? 'Sent' : 'Received'}{' '}
							{!confirmed ? '(Unconfirmed)' : ''}
						</Text02S>
						<Caption13S color={'gray'} style={styles.date}>
							{timeAgo(timestamp)}
						</Caption13S>
					</View>
				</View>
				<View style={styles.col2} color={'transparent'}>
					<Text02S style={styles.value}>
						{txType === 'sent' ? '-' : '+'} {bitcoinSymbol}{' '}
						{bitcoinFormatted.replace('-', '')}
					</Text02S>
					<Caption13S color={'gray'} style={styles.value}>
						{fiatSymbol}
						{fiatFormatted.replace('-', '')}
					</Caption13S>
				</View>
			</TouchableOpacity>
		);
	},
);

const ListHeaderComponent = memo(
	(): ReactElement => {
		return (
			<View style={styles.header} color={'transparent'}>
				<Subtitle>Transactions</Subtitle>
			</View>
		);
	},
	() => true,
);

const ActivityList = (): ReactElement => {
	const navigation = useNavigation();
	const activityItems = useSelector(
		(state: Store) => state.activity.itemsFiltered,
	);
	const [refreshing, setRefreshing] = useState(false);

	const renderItem = useCallback(
		({ item }): ReactElement => {
			return (
				<ListItem
					key={item.id}
					item={item}
					onPress={(): void =>
						navigation.navigate('ActivityDetail', { activityItem: item })
					}
				/>
			);
		},
		//eslint-disable-next-line react-hooks/exhaustive-deps
		[activityItems],
	);

	const onRefresh = async (): Promise<void> => {
		setRefreshing(true);
		//Refresh wallet and then update activity list
		await Promise.all([refreshWallet(), refreshLightningTransactions()]);
		await updateActivityList();
		setRefreshing(false);
	};

	return (
		<FlatList
			style={styles.content}
			data={activityItems}
			renderItem={renderItem}
			keyExtractor={(item): string => item.id}
			refreshControl={
				<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
			}
			ListHeaderComponent={ListHeaderComponent}
		/>
	);
};

const styles = StyleSheet.create({
	content: {
		paddingVertical: 20,
	},
	item: {
		display: 'flex',
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		backgroundColor: 'transparent',
		marginBottom: 24,
	},
	col1: {
		display: 'flex',
		flexDirection: 'row',
		flex: 5,
	},
	col2: {
		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'flex-end',
		flex: 3,
	},
	iconCircle: {
		borderRadius: 20,
		width: 36,
		height: 36,
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		marginRight: 14,
	},
	value: {
		textAlign: 'right',
	},
	note: {},
	date: {
		marginTop: 4,
	},
	header: {
		marginBottom: 23,
	},
});

export default memo(ActivityList);
