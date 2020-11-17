import React from "react";
import { Text, View } from "../../styles/components";
import NavigationHeader from "../../components/NavigationHeader";
import { StyleSheet } from "react-native";

const HistoryDetail = () => {
	return (
		<View style={styles.container}>
			<NavigationHeader title="History Detail" />
			<View style={styles.content}>
				<Text>History Detail</Text>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	content: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center"
	}
});

export default HistoryDetail;
