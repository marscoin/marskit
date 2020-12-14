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
import Store from "../../store/types";
import { useSelector } from "react-redux";

const Wallets = ({ navigation }) => {
	const lightning = useSelector((state: Store) => state.lightning);

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
					<Text>LND started: {lightning.state.lndRunning ? '✅' : '❌'}</Text>
					<Text>LND wallet unlocked: {lightning.state.walletUnlocked ? '✅' : '❌'}</Text>
					<Text>LND GRPC ready: {lightning.state.grpcReady ? '✅' : '❌'}</Text>
					<Text>LND Synced: {lightning.info.syncedToChain ? '✅' : '❌'}</Text>
					<Text>Block height: {lightning.info.blockHeight}</Text>
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
