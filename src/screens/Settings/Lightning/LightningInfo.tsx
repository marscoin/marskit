import React, { memo, useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import {
	View,
	Feather,
	Text,
	TouchableOpacity
} from "../../../styles/components";
import List from "../../../components/List";
import {
	copyNewAddressToClipboard,
	getBalance,
	getInfo,
	openMaxChannel,
	payInvoice
} from "../../../utils/lightning-debug";

const LightningInfo = ({ navigation }) => {
	const [content, setContent] = useState<string>('');

	const SettingsListData = [
		{
			title: "LND debug commands",
			data: [
				{
					title: "Get Info",
					type: "button",
					onPress: () => getInfo(setContent)
				},
				{
					title: "Show all balances",
					type: "button",
					onPress: () => getBalance(setContent)
				},
				{
					title: "Copy receive address",
					type: "button",
					onPress: () => copyNewAddressToClipboard(setContent)
				},
				{
					title: "Open channel",
					type: "button",
					onPress: () => openMaxChannel(setContent)
				},
				{
					title: "Pay invoice",
					type: "button",
					onPress: () => payInvoice(setContent)
				},
			]
		},
	];

	return (
		<View style={styles.container}>
			<TouchableOpacity activeOpacity={0.7} onPress={navigation.goBack} style={styles.row}>
				<Feather style={{}} name="arrow-left" size={30} />
				<Text style={styles.backText}>Lightning</Text>
			</TouchableOpacity>
			<List data={SettingsListData} />
			<ScrollView>
				<Text style={styles.debugContent}>{content}</Text>
			</ScrollView>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1
	},
	row: {
		flexDirection: "row",
		alignItems: "center",
		paddingLeft: 10,
		paddingVertical: 8
	},
	backText: {
		fontSize: 20
	},
	debugContent: {
		textAlign: "center"
	}
});

export default memo(LightningInfo);
