import React, { memo } from "react";
import { StyleSheet } from "react-native";
import { useSelector } from "react-redux";
import { ThemeProvider } from "styled-components/native";
import { StatusBar, SafeAreaView } from "./styles/components";
import RootNavigator from "./navigation/root/RootNavigator";
import Store from "./store/types";

const App = () => {
	const settings = useSelector((state: Store) => state.settings);
	return (
		<ThemeProvider theme={settings.theme}>
			<StatusBar />
			<SafeAreaView style={styles.container}>
				<RootNavigator />
			</SafeAreaView>
		</ThemeProvider>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1
	}
});

export default memo(App);
