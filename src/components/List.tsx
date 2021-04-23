import React, { memo, ReactElement } from 'react';
import { SectionList, StyleSheet, Switch } from 'react-native';
import { Text, TouchableOpacity, View } from '../styles/components';
import { useNavigation } from '@react-navigation/native';

const _ItemHeader = ({ title }: { title: string }): ReactElement => (
	<View style={styles.itemHeader}>
		<Text color="white" style={styles.header}>
			{title}
		</Text>
	</View>
);
const ItemHeader = memo(_ItemHeader, (prevProps, nextProps) => {
	return prevProps.title === nextProps.title;
});

type ItemData = {
	title: string;
	type: string;
	onPress: Function;
	enabled?: boolean;
	hide?: boolean;
};

interface IItem extends ItemData {
	navigation: Object;
	type: string;
}

const _Item = ({
	type,
	title,
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
				activeOpacity={0.7}
				onPress={_onPress}
				style={styles.row}>
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
			</TouchableOpacity>
		);
	}
	return (
		<TouchableOpacity
			activeOpacity={0.7}
			onPress={enabled ? _onPress : null}
			style={styles.row}>
			<Text color="white" style={styles.title}>
				{title}
			</Text>
		</TouchableOpacity>
	);
};
const Item = memo(_Item, (prevProps, nextProps) => {
	return (
		prevProps.title === nextProps.title &&
		prevProps.type === nextProps.type &&
		prevProps.enabled === nextProps.enabled
	);
});

interface IListData {
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
			renderSectionHeader={({ section: { title } }): ReactElement => (
				<ItemHeader title={title} />
			)}
			renderItem={({ item }): ReactElement | null => {
				if (item.hide === false) {
					return <Item {...item} navigation={navigation} />;
				}
				return null;
			}}
			ItemSeparatorComponent={({
				leadingItem: { hide },
			}): ReactElement | null => {
				if (!hide) {
					return <View style={styles.separator} />;
				}
				return null;
			}}
			stickySectionHeadersEnabled={true}
		/>
	);
};

const styles = StyleSheet.create({
	row: {
		flexDirection: 'row',
		backgroundColor: '#333333',
		height: 60,
		alignItems: 'center',
		paddingLeft: 10,
	},
	itemHeader: {
		backgroundColor: '#4C4C4C',
		height: 60,
		justifyContent: 'center',
		paddingLeft: 10,
	},
	header: {
		fontSize: 18,
		fontWeight: 'bold',
	},
	title: {
		fontSize: 14,
	},
	separator: {
		width: '100%',
		height: 1,
		backgroundColor: 'white',
	},
	leftColumn: {
		flex: 1,
		justifyContent: 'center',
	},
	rightColumn: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'flex-end',
		paddingRight: 10,
	},
});

export default memo(List);
