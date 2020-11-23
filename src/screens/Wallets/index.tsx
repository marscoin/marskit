/**
 * @format
 * @flow strict-local
 */

import React, { memo } from "react";
import {
	StyleSheet,
} from "react-native";
import { View, Text, TouchableOpacity } from "../../styles/components";
import Logo from "../../components/Logo";
import Header from "./Header";

const Wallets = ({ navigation }) => {
	return (
		<View style={styles.container}>
			<Header />
			<View style={styles.logo}>
				<Logo />
				<TouchableOpacity
					onPress={() => navigation.navigate("WalletsDetail")}
					style={styles.button}
				>
					<Text>Go To Nested Wallets Screen</Text>
				</TouchableOpacity>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	logo: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
	},
	button: {
		marginTop: 20
	}
});

export default memo(Wallets);
