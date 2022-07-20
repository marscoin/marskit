import React, {
	memo,
	ReactElement,
	useCallback,
	useState,
	useMemo,
} from 'react';
import { useNavigation } from '@react-navigation/native';
import {
	FlatList,
	NativeScrollEvent,
	NativeSyntheticEvent,
	StyleProp,
	StyleSheet,
	ViewStyle,
} from 'react-native';
import { useSelector } from 'react-redux';

import {
	Caption13Up,
	RefreshControl,
	Subtitle,
	View,
} from '../../styles/components';
import Store from '../../store/types';
import { EActivityTypes } from '../../store/types/activity';
import { updateActivityList } from '../../store/actions/activity';
import { refreshWallet } from '../../utils/wallet';
import { groupActivityItems } from '../../utils/activity';
import ListItem from './ListItem';

const ListHeaderComponent = memo(
	(): ReactElement => {
		return (
			<View style={styles.header} color={'transparent'}>
				<Subtitle>Activity</Subtitle>
			</View>
		);
	},
	() => true,
);

const ActivityList = ({
	assetFilter,
	onScroll,
	style,
	contentContainerStyle,
	progressViewOffset,
	showTitle = true,
}: {
	assetFilter?: EActivityTypes[];
	onScroll?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
	style?: StyleProp<ViewStyle> | undefined;
	contentContainerStyle?: StyleProp<ViewStyle> | undefined;
	progressViewOffset?: number | undefined;
	showTitle?: boolean;
}): ReactElement => {
	const navigation = useNavigation();

	const activityItems = useSelector((state: Store) =>
		state.activity.itemsFiltered.filter(
			(v) => !assetFilter || assetFilter.indexOf(v.activityType) > -1,
		),
	);

	// group items by categories: today, yestarday, this month, this year, earlier
	// and attach to them formattedDate
	const groupedItems = useMemo(
		() => groupActivityItems(activityItems),
		[activityItems],
	);

	const [refreshing, setRefreshing] = useState(false);

	const renderItem = useCallback(
		({ item }): ReactElement => {
			if (typeof item === 'string') {
				return (
					<Caption13Up color="gray1" style={styles.category} key={item}>
						{item}
					</Caption13Up>
				);
			}

			return (
				<ListItem
					key={item.id}
					item={item}
					onPress={(): void =>
						// @ts-ignore
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
		await Promise.all([refreshWallet({})]);
		await updateActivityList();
		setRefreshing(false);
	};

	return (
		<FlatList
			onScroll={onScroll}
			style={[styles.content, style]}
			contentContainerStyle={contentContainerStyle}
			data={groupedItems}
			renderItem={renderItem}
			keyExtractor={(item): string =>
				typeof item === 'string' ? item : item.id
			}
			refreshControl={
				<RefreshControl
					refreshing={refreshing}
					onRefresh={onRefresh}
					progressViewOffset={progressViewOffset}
				/>
			}
			ListHeaderComponent={showTitle ? ListHeaderComponent : undefined}
		/>
	);
};

const styles = StyleSheet.create({
	content: {
		paddingTop: 20,
		paddingBottom: 100,
	},
	category: {
		marginBottom: 16,
	},
	header: {
		marginBottom: 23,
	},
});

export default memo(ActivityList);
