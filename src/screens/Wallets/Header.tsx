import React, { memo } from "react";
import { StyleSheet } from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { Feather, View } from "../../styles/components";
import { updateSettings } from "../../store/actions/settings";
import { useNavigation } from "@react-navigation/native";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import Store from "../../store/types";

const Header = () => {
	const dispatch = useDispatch();
	const settings = useSelector((state: Store ) => state.settings);
	const navigation = useNavigation<DrawerNavigationProp<any>>();

	const updateTheme = () => {
		try {
			const theme = settings.theme === "dark" ? "light" : "dark";
			dispatch(updateSettings({ theme }));
		} catch {}
	};

	return (
		<View style={styles.container}>
			<View style={styles.leftColumn}>
				<Feather
					onPress={updateTheme}
					name={settings.theme === "light" ? "moon" : "sun"}
					size={30}
				/>
			</View>
			<View style={styles.middleColumn} />
			<View style={styles.rightColumn}>
				<Feather
					style={styles.rightIcon}
					onPress={navigation.openDrawer}
					name="menu"
					size={30}
				/>
			</View>
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
	rightIcon: {
	},
	leftColumn: {
		flex: 1,
		justifyContent: "center"
	},
	middleColumn: {
		flex: 1.5,
		justifyContent: "center"
	},
	rightColumn: {
		flex: 1,
		justifyContent: "center",
		alignItems: "flex-end"
	},
});

export default memo(Header);
