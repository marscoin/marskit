import React, { ReactElement, useEffect, useState } from 'react';
import {
	RefreshControl,
	Text,
	TouchableOpacity,
	View,
} from '../../styles/components';
import NavigationHeader from '../../components/NavigationHeader';
import { FlatList, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import Store from '../../store/types';
import useDisplayValues from '../../utils/exchange-rate/useDisplayValues';
import LightingIcon from '../../assets/lightning-logo.svg';
import { IService } from '../../utils/chainreactor/types';

import { refreshServiceList } from '../../store/actions/chainreactor';
import { updateExchangeRates } from '../../store/actions/wallet';
import { truncate } from '../../utils/helpers';
import { showErrorNotification } from '../../utils/notifications';

const ListItem = ({
	item,
	onPress,
}: {
	item: IService;
	onPress: () => void;
}): ReactElement => {
	const { product_id, min_channel_size, max_channel_size, available } = item;

	const minChannelSizeDisplay = useDisplayValues(min_channel_size);
	const maxChannelSizeDisplay = useDisplayValues(max_channel_size);

	const iconSize = 35;
	let walletIcon = (
		<LightingIcon viewBox="0 0 300 300" height={iconSize} width={iconSize} />
	);

	let name = `Product ${truncate(product_id, 8)}`;
	switch (product_id) {
		case '60eed21d3db8ba8ac85c7322': {
			name = 'Lightning Channel';
		}
	}

	return (
		<TouchableOpacity style={styles.item} onPress={onPress}>
			<View style={styles.col1}>{walletIcon}</View>

			<View style={styles.col2}>
				<Text>{name}</Text>
				<Text>
					{minChannelSizeDisplay.bitcoinSymbol}
					{minChannelSizeDisplay.bitcoinFormatted} to{' '}
					{maxChannelSizeDisplay.bitcoinSymbol}
					{maxChannelSizeDisplay.bitcoinFormatted}
				</Text>
			</View>

			<View style={styles.col3}>
				<Text>Available: {available ? '✅' : '❌'}</Text>
			</View>
		</TouchableOpacity>
	);
};

const ChainReactorScreen = ({ navigation }): ReactElement => {
	const { serviceList, orders } = useSelector(
		(state: Store) => state.chainreactor,
	);

	const [refreshing, setRefreshing] = useState(false);

	useEffect(() => {
		refreshServiceList().catch(() => {
			showErrorNotification({
				title: 'Update failed',
				message: 'Failed to refresh service list',
			});
		});
	});

	const renderItem = ({ item }: { item: IService }): ReactElement => {
		return (
			<ListItem
				key={item.product_id}
				item={item}
				onPress={(): void =>
					navigation.navigate('ChainReactorOrder', { service: item })
				}
			/>
		);
	};

	const onRefresh = async (): Promise<void> => {
		setRefreshing(true);
		//Refresh wallet and then update activity list
		await Promise.all([refreshServiceList(), updateExchangeRates()]);
		setRefreshing(false);
	};

	return (
		<View style={styles.container}>
			<NavigationHeader title={'Chain Reactor'} />

			<Text style={styles.text}>Current orders: {orders.length}</Text>

			<FlatList
				data={serviceList}
				renderItem={renderItem}
				keyExtractor={(item): string => item.product_id}
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
	text: {
		textAlign: 'center',
	},
	item: {
		padding: 20,
		borderColor: 'gray',
		borderBottomWidth: 1,
		display: 'flex',
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		backgroundColor: 'transparent',
	},
	col1: {
		display: 'flex',
		flexDirection: 'row',
		flex: 1,
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
});

export default ChainReactorScreen;
