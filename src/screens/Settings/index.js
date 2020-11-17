import React, { memo } from "react";
import { StyleSheet } from "react-native";
import {
	View,
	Feather,
	Text,
	TouchableOpacity
} from "../../styles/components";
import { useDispatch, useSelector } from "react-redux";
import { updateSettings } from "../../actions/settings";
import List from "../../components/List";

const themes = require("../../styles/themes");

const Settings = ({ navigation }) => {
	const dispatch = useDispatch();
	const settings = useSelector((state) => state.settings);
	
	const updateTheme = () => {
		try {
			const theme = settings.theme.id === "dark" ? themes["light"] : themes["dark"];
			dispatch(updateSettings({ theme }));
		} catch {}
	};
	
	const DATA = [
		{
			title: "Settings",
			data: [
				{
					title: "Dark Mode",
					type: "switch",
					enabled: settings.theme.id === "dark",
					onPress: updateTheme
				},
				{
					title: "Fiat Currency Selection",
					type: "button",
					onPress: () => navigation.navigate("TempSettings")
				},
				{
					title: "Security",
					type: "button",
					onPress: () => navigation.navigate("TempSettings")
				},
				{
					title: "Biometrics",
					type: "button",
					onPress: () => navigation.navigate("TempSettings")
				},
				{
					title: "Pin",
					type: "button",
					onPress: () => navigation.navigate("TempSettings")
				},
				{
					title: "Two-Factor Authentication",
					type: "button",
					onPress: () => navigation.navigate("TempSettings")
				},
			]
		},
		{
			title: "About",
			data: [
				{
					title: "Twitter: @synonym_to",
					type: "button",
					onPress: () => navigation.navigate("TempSettings")
				},
				{
					title: "Telegram",
					type: "button",
					onPress: () => navigation.navigate("TempSettings")
				},
				{
					title: "Website: synonym.to",
					type: "button",
					onPress: () => navigation.navigate("TempSettings")
				},
				{
					title: "Leave A Review",
					type: "button",
					onPress: () => navigation.navigate("TempSettings")
				},
				{
					title: "Report A Bug",
					type: "button",
					onPress: () => navigation.navigate("TempSettings")
				},
				{
					title: "Contribute",
					type: "button",
					onPress: () => navigation.navigate("TempSettings")
				},
				{
					title: "Legal",
					type: "button",
					onPress: () => navigation.navigate("TempSettings")
				},
			]
		},
		{
			title: "Support",
			data: [
				{
					title: "Help Centre",
					type: "button",
					onPress: () => navigation.navigate("TempSettings")
				},
				{
					title: "Email: support@synonym.to",
					type: "button",
					onPress: () => navigation.navigate("TempSettings")
				}
			]
		}
	];
	
	return (
		<View style={styles.container}>
			<TouchableOpacity activeOpacity={0.7} onPress={navigation.goBack} style={styles.row}>
				<Feather style={{}} name="arrow-left" size={30} />
				<Text style={styles.backText}>Settings</Text>
			</TouchableOpacity>
			<List data={DATA} />
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
	}
});

export default memo(Settings);
