import React, { memo, ReactElement, useCallback } from 'react';
import { SectionList, StyleSheet, Switch } from 'react-native';
import {
	Text,
	Text01S,
	Caption13Up,
	TouchableOpacity,
	View,
	ChevronRight,
} from '../styles/components';
import { useNavigation } from '@react-navigation/native';
import Card from './Card';

const _ItemHeader = memo(
	({ title }: { title: string }): ReactElement => (
		<View color={'transparent'} style={styles.itemHeader}>
			<Caption13Up color="gray1" style={styles.header}>
				{title.toUpperCase()}
			</Caption13Up>
		</View>
	),
);
const ItemHeader = memo(_ItemHeader, (prevProps, nextProps) => {
	return prevProps.title === nextProps.title;
});

type TItemType = 'switch' | 'button';

type ItemData = {
	title: string;
	value?: string;
	type: TItemType;
	onPress: Function;
	enabled?: boolean;
	hide?: boolean;
};

interface IItem extends ItemData {
	navigation: Object;
	type: TItemType;
}

const _Item = memo(
	({
		type,
		title,
		value,
		onPress,
		navigation,
		enabled = true,
		hide = false,
	}: IItem): ReactElement => {
		if (hide) {
			return <View />;
		}
		const _onPress = (): void => onPress(navigation);
		if (type === 'switch') {
			return (
				<TouchableOpacity
					color="transparent"
					activeOpacity={0.7}
					onPress={_onPress}>
					<Card style={styles.card}>
						<View color="transparent" style={styles.leftColumn}>
							<Text color="white" style={styles.title}>
								{title}
							</Text>
						</View>
						<View color="transparent" style={styles.rightColumn}>
							<Switch
								trackColor={{ false: '#767577', true: '#81b0ff' }}
								thumbColor={'#f4f3f4'}
								ios_backgroundColor="#3e3e3e"
								onValueChange={_onPress}
								value={enabled}
							/>
						</View>
					</Card>
				</TouchableOpacity>
			);
		}
		return (
			<TouchableOpacity
				color="transparent"
				activeOpacity={0.7}
				onPress={enabled ? _onPress : null}
				style={styles.row}>
				<Card style={styles.card}>
					<View color="transparent" style={styles.leftColumn}>
						<Text color="white" style={styles.title}>
							{title}
						</Text>
					</View>
					<View color="transparent" style={styles.rightColumn}>
						<Text01S color={'gray2'} style={styles.valueText}>
							{value}
						</Text01S>
						<ChevronRight color={'gray2'} />
					</View>
				</Card>
			</TouchableOpacity>
		);
	},
);
const Item = memo(_Item, (prevProps, nextProps) => {
	return (
		prevProps.title === nextProps.title &&
		prevProps.type === nextProps.type &&
		prevProps.enabled === nextProps.enabled
	);
});

export interface IListData {
	title: string;
	data: ItemData[];
}

const List = ({ data }: { data: IListData[] }): ReactElement => {
	const navigation = useNavigation();
	return (
		<SectionList
			sections={data}
			extraData={data}
			keyExtractor={(item): string => item.title}
			renderSectionHeader={useCallback(
				({ section: { title } }): ReactElement => (
					<ItemHeader title={title} />
				),
				[],
			)}
			renderItem={useCallback(({ item }): ReactElement | null => {
				if (item.hide === false) {
					return <Item {...item} navigation={navigation} />;
				}
				return null;
				// eslint-disable-next-line react-hooks/exhaustive-deps
			}, [])}
			stickySectionHeadersEnabled={false}
		/>
	);
};

const styles = StyleSheet.create({
	row: {
		height: 55,
	},
	card: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingHorizontal: 16,
		paddingVertical: 14,
		minHeight: 51,
	},
	itemHeader: {
		marginTop: 27,
		justifyContent: 'center',
	},
	header: {
		fontSize: 18,
		fontWeight: 'bold',
	},
	title: {
		fontSize: 14,
	},
	valueText: {
		marginRight: 15,
	},
	leftColumn: {
		justifyContent: 'center',
	},
	rightColumn: {
		alignItems: 'center',
		flexDirection: 'row',
	},
});

export default memo(List);
