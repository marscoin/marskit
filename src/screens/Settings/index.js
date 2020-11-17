import React, { memo } from "react";
import { StyleSheet } from "react-native";
import {
	View,
	Feather
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
					title: "Twitter",
					type: "button",
					onPress: () => navigation.navigate("TempSettings")
				},
				{
					title: "Telegram",
					type: "button",
					onPress: () => navigation.navigate("TempSettings")
				},
				{
					title: "Website",
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
					title: "Email: support@synonym.com",
					type: "button",
					onPress: () => navigation.navigate("TempSettings")
				}
			]
		}
	];
	
	return (
		<View style={styles.container}>
			<Feather style={{ marginVertical: 8 }} name="arrow-left" size={30} onPress={navigation.goBack} />
			<List data={DATA} />
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1
	}
});

export default memo(Settings);
