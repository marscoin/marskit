/**
 * @format
 * @flow strict-local
 */

import React, { memo } from "react";
import {
	StyleSheet,
} from "react-native";
import {
	View,
	SafeAreaView,
	StatusBar,
} from "../styles/components";
import { useSelector } from "react-redux";
import { ThemeProvider } from "styled-components/native";
import Logo from "../components/Logo";
import Header from "../components/Header";

const App = () => {
	const { settings } = useSelector((state) => state);

	return (
		<ThemeProvider theme={settings.theme}>
			<StatusBar />
			<SafeAreaView style={styles.container}>
				<Header />
				<View style={styles.logo}>
					<Logo />
				</View>
			</SafeAreaView>
		</ThemeProvider>
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
});

export default memo(App);
