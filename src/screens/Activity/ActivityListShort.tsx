import React, { memo, ReactElement, useCallback, useMemo } from 'react';
import { useNavigation } from '@react-navigation/native';
import { StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';

import { Caption13Up, Subtitle, View } from '../../styles/components';
import Store from '../../store/types';
import { groupActivityItems } from '../../utils/activity';
import Button from '../../components/Button';
import ListItem from './ListItem';

const ActivityList = (): ReactElement => {
	const navigation = useNavigation();

	const activityItems = useSelector(
		(state: Store) => state.activity.itemsFiltered,
	).slice(0, 3);

	// group items by categories: today, yestarday, this month, this year, earlier
	// and attach to them formattedDate
	const groupedItems = useMemo(
		() => groupActivityItems(activityItems),
		[activityItems],
	);

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

	if (activityItems.length === 0) {
		return <></>;
	}

	return (
		<View style={styles.content} color={'transparent'}>
			<View style={styles.header} color={'transparent'}>
				<Subtitle>Activity</Subtitle>
			</View>
			{groupedItems.map((item) => renderItem({ item }))}
			<Button
				text="Show all activity"
				size="big"
				variant="transparent"
				onPress={(): void => {
					// @ts-ignore
					navigation.navigate('ActivityFiltered');
				}}
			/>
		</View>
	);
};

const styles = StyleSheet.create({
	content: {
		paddingTop: 20,
	},
	category: {
		marginBottom: 16,
	},
	header: {
		marginBottom: 23,
	},
});

export default memo(ActivityList);
