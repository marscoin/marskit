import React from "react";
import { Text, View } from "../../styles/components";
import NavigationHeader from "../../components/NavigationHeader";
import { StyleSheet } from "react-native";

const ProfileDetail = () => {
	return (
		<View style={styles.container}>
			<NavigationHeader title="Profile Detail" />
			<View style={styles.content}>
				<Text>Profile Detail</Text>
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

export default ProfileDetail;
