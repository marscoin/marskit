import React, { memo, ReactElement, useCallback } from 'react';
import { SectionList, StyleSheet } from 'react-native';
import {
	Text01S,
	Caption13Up,
	View,
	ChevronRight,
	Checkmark,
	Switch,
} from '../styles/components';
import { useNavigation } from '@react-navigation/native';
import Card from './Card';

const _ItemHeader = memo(({ title }: { title?: string }): ReactElement => {
	if (!title) {
		return <View />;
	}

	return (
		<View color={'transparent'} style={styles.itemHeader}>
			<Caption13Up color="gray1">{title.toUpperCase()}</Caption13Up>
		</View>
	);
});

const ItemHeader = memo(_ItemHeader, (prevProps, nextProps) => {
	return prevProps.title === nextProps.title;
});

type TItemType = 'switch' | 'button' | 'textButton';

type ItemData = {
	title: string;
	value?: string | boolean;
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

		const useCheckmark = typeof value === 'boolean';

		const _onPress = (): void => onPress(navigation);
		if (type === 'switch') {
			return (
				<View color="transparent" style={styles.row}>
					<Card style={styles.card} onPress={_onPress}>
						<View color="transparent" style={styles.leftColumn}>
							<Text01S color="white">{title}</Text01S>
						</View>
						<View color="transparent" style={styles.rightColumn}>
							<Switch onValueChange={_onPress} value={enabled} />
						</View>
					</Card>
				</View>
			);
		}
		if (type === 'textButton') {
			return (
				<View color="transparent" style={styles.row}>
					<Card style={styles.card} onPress={enabled ? _onPress : undefined}>
						<View color="transparent" style={styles.leftColumn}>
							<Text01S color="white">{title}</Text01S>
						</View>
						<View color="transparent" style={styles.rightColumn}>
							<Text01S color={'gray1'}>{value}</Text01S>
						</View>
					</Card>
				</View>
			);
		}
		return (
			<View color="transparent" style={styles.row}>
				<Card style={styles.card} onPress={enabled ? _onPress : undefined}>
					<View color="transparent" style={styles.leftColumn}>
						<Text01S color="white">{title}</Text01S>
					</View>
					<View color="transparent" style={styles.rightColumn}>
						{useCheckmark ? (
							value ? (
								<Checkmark />
							) : null
						) : (
							<>
								<Text01S style={styles.valueText}>{value}</Text01S>
								<ChevronRight color={'gray1'} />
							</>
						)}
					</View>
				</Card>
			</View>
		);
	},
);
const Item = memo(_Item, (prevProps, nextProps) => {
	return (
		prevProps.title === nextProps.title &&
		prevProps.value === nextProps.value &&
		prevProps.type === nextProps.type &&
		prevProps.enabled === nextProps.enabled
	);
});

export interface IListData {
	title?: string;
	data: ItemData[];
}

const List = ({
	data,
	onScrollDownChange,
}: {
	data: IListData[];
	onScrollDownChange?: (boolean) => void;
}): ReactElement => {
	const navigation = useNavigation();
	return (
		<SectionList
			onScroll={
				onScrollDownChange
					? (e): void => onScrollDownChange(e.nativeEvent.contentOffset.y > 15)
					: undefined
			}
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
			contentContainerStyle={styles.contentContainerStyle}
		/>
	);
};

const styles = StyleSheet.create({
	contentContainerStyle: {
		paddingBottom: 55,
	},
	row: {
		height: 55,
	},
	card: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingHorizontal: 0,
		paddingVertical: 14,
		minHeight: 51,
		backgroundColor: 'rgba(255, 255, 255, 0)',
		borderBottomColor: 'rgba(255, 255, 255, 0.1)',
		borderBottomWidth: 1,
		borderRadius: 0,
	},
	itemHeader: {
		marginTop: 27,
		justifyContent: 'center',
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
