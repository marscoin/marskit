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
import { lightningStatusMessage } from "../../utils/lightning-debug";
import WalletListItem from "./WalletListItem";

const Wallets = ({ navigation }) => {
	const lightning = useSelector((state: Store) => state.lightning);

	//TODO this will probably fetch all available wallets and list them

	return (
		<View style={styles.container}>
			<Header />
			<View style={styles.logo}>
				<Logo />
			</View>

			<TouchableOpacity
				onPress={() => navigation.navigate("WalletsDetail")}
			>
				<WalletListItem title={"Bitcoin"} network={`Lightning network (${lightningStatusMessage(lightning)})`} balance={0} fiatBalance={0} />
			</TouchableOpacity>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		paddingRight: 20,
		paddingLeft: 20,
	},
	logo: {
		alignItems: "center",
		justifyContent: "center",
		marginBottom: 20,
	},
});

export default memo(Wallets);
