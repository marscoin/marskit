import React, { memo, ReactElement } from "react";
import { SectionList, StyleSheet, Switch } from "react-native";
import { Text, TouchableOpacity, View } from "../styles/components";
import { useNavigation } from "@react-navigation/native";

const ItemHeader = ({ title }: { title: string }): ReactElement => (
	<View style={styles.itemHeader}>
		<Text color="white" style={styles.header}>{title}</Text>
	</View>
);

type ItemData = {
	title: string,
	type: string,
	onPress: Function,
	enabled?: boolean,
}

interface IItem extends ItemData {
	navigation: Object,
	type: string
}

const Item = (
	{
		type,
		title,
		onPress,
		navigation,
		enabled = true
	}: IItem): ReactElement => {
	const _onPress = () => onPress(navigation);
	if (type === "switch") {
		return (
			<TouchableOpacity activeOpacity={0.7} onPress={_onPress} style={styles.row}>
				<View color="transparent" style={styles.leftColumn}>
					<Text color="white" style={styles.title}>{title}</Text>
				</View>
				<View color="transparent" style={styles.rightColumn}>
					<Switch
						trackColor={{ false: "#767577", true: "#81b0ff" }}
						thumbColor={"#f4f3f4"}
						ios_backgroundColor="#3e3e3e"
						onValueChange={_onPress}
						value={enabled}
					/>
				</View>
			</TouchableOpacity>
		);
	}
	return (
		<TouchableOpacity activeOpacity={0.7} onPress={enabled ? _onPress : null} style={styles.row}>
			<Text color="white" style={styles.title}>{title}</Text>
		</TouchableOpacity>
	);
};

interface IListData {
	title: string,
	data: ItemData[]
}

const List = ({ data }: { data: IListData[] }) => {
	const navigation = useNavigation();
	return (
		<SectionList
			sections={data}
			keyExtractor={(item, index) => `${item}${index}`}
			renderSectionHeader={({ section: { title }}) => <ItemHeader title={title} />}
			renderItem={({ item }) => <Item {...item} navigation={navigation} />}
			ItemSeparatorComponent={() => <View style={styles.separator} />}
			stickySectionHeadersEnabled={true}
		/>
	);
};

const styles = StyleSheet.create({
	row: {
		flexDirection: "row",
		backgroundColor: "#333333",
		height: 60,
		alignItems: "center",
		paddingLeft: 10
	},
	itemHeader: {
		backgroundColor: "#4C4C4C",
		height: 60,
		justifyContent: "center",
		paddingLeft: 10
	},
	header: {
		fontSize: 18,
		fontWeight: "bold"
	},
	title: {
		fontSize: 14
	},
	separator: {
		width: "100%",
		height: 1,
		backgroundColor: "white"
	},
	leftColumn: {
		flex: 1,
		justifyContent: "center"
	},
	rightColumn: {
		flex: 1,
		justifyContent: "center",
		alignItems: "flex-end",
		paddingRight: 10
	}
});

export default memo(List);
