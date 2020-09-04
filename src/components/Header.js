import React, { memo } from "react";
import { StyleSheet } from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { Feather, View } from "../styles/components";
import { updateSettings, } from "../actions/settings";

const themes = require("../styles/themes");

const Header = () => {
	const dispatch = useDispatch();
	const settings = useSelector((state) => state.settings);

	const updateTheme = () => {
		try {
			const theme = settings.theme.id === "dark" ? themes["light"] : themes["dark"];
			dispatch(updateSettings({ theme }));
		} catch {}
	};

	return (
		<View style={styles.container}>
			<Feather
				onPress={updateTheme}
				name={settings.theme.id === "light" ? "moon" : "sun"}
				size={30}
			/>
		</View>
	);
};
const styles = StyleSheet.create({
	container: {
		flexDirection: "row",
		justifyContent: "flex-end",
		alignItems: "center",
		marginTop: 15,
		marginHorizontal: 10,
		marginBottom: 20,
	},
});

export default memo(Header);
