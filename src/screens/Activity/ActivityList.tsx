import React, { memo, ReactElement, useState } from 'react';
import {
	Text,
	TouchableOpacity,
	RefreshControl,
	Feather,
} from '../../styles/components';
import { FlatList, StyleSheet, View } from 'react-native';
import { useSelector } from 'react-redux';
import Store from '../../store/types';
import { IActivityItem } from '../../store/types/activity';
import { refreshWallet } from '../../utils/wallet';
import { refreshLightningTransactions } from '../../store/actions/lightning';
import { useNavigation } from '@react-navigation/native';

import BitcoinIcon from '../../assets/bitcoin-logo.svg';
import LightingIcon from '../../assets/lightning-logo.svg';
import { truncate } from '../../utils/helpers';
import { updateActivityList } from '../../store/actions/activity';
import useDisplayValues from '../../hooks/displayValues';

const ListItem = ({
	item,
	onPress,
}: {
	item: IActivityItem;
	onPress: () => void;
}): ReactElement => {
	const {
		message,
		address,
		value,
		activityType,
		txType,
		confirmed,
		timestamp,
	} = item;

	const { bitcoinFormatted, bitcoinSymbol, fiatFormatted, fiatSymbol } =
		useDisplayValues(value);

	const iconSize = 20;

	let walletIcon;
	switch (activityType) {
		case 'lightning': {
			walletIcon = (
				<LightingIcon
					viewBox="0 0 300 300"
					height={iconSize}
					width={iconSize}
				/>
			);
			break;
		}
		case 'onChain': {
			walletIcon = (
				<BitcoinIcon viewBox="0 0 70 70" height={iconSize} width={iconSize} />
			);
			break;
		}
	}

	const directionIcon =
		txType === 'sent' ? (
			<Feather name="arrow-up" size={iconSize} />
		) : (
			<Feather name="arrow-down" size={iconSize} />
		);

	const date = new Date(timestamp);

	const note = message || address || '';

	return (
		<TouchableOpacity style={styles.item} onPress={onPress}>
			<View style={styles.col1}>
				{walletIcon}
				{directionIcon}
				<Text>{confirmed ? '✅' : '⌛'}</Text>
			</View>
			<View style={styles.col2}>
				<Text style={styles.note}>{truncate(note, 20)}</Text>
				<Text style={styles.date}>
					{date.toLocaleDateString(undefined, {
						hour: 'numeric',
						minute: 'numeric',
						year: 'numeric',
						month: 'long',
						day: 'numeric',
					})}
				</Text>
			</View>
			<View style={styles.col3}>
				<Text style={styles.value}>
					{bitcoinSymbol}
					{bitcoinFormatted}
				</Text>
				<Text style={styles.value}>
					{fiatSymbol}
					{fiatFormatted}
				</Text>
			</View>
		</TouchableOpacity>
	);
};

const ActivityList = (): ReactElement => {
	const navigation = useNavigation();
	const activityItems = useSelector(
		(state: Store) => state.activity.itemsFiltered,
	);
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
		/>
	);
};

const styles = StyleSheet.create({
	content: {
		padding: 20,
	},
	item: {
		minHeight: 60,
		display: 'flex',
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		backgroundColor: 'transparent',
	},
	col1: {
		display: 'flex',
		flexDirection: 'row',
		flex: 2,
	},
	col2: {
		display: 'flex',
		flexDirection: 'column',
		flex: 5,
	},
	col3: {
		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'flex-end',
		flex: 3,
	},
	value: {
		textAlign: 'right',
	},
	note: {},
	date: {
		fontWeight: '300',
	},
});

export default memo(ActivityList);
