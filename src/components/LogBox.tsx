/**
 * @format
 * @flow strict-local
 */
import React from "react";
import {
	StyleSheet,
	ScrollView,
	Share,
} from "react-native";
import {
	View,
	Text,
} from "../styles/components";
import Button from "./Button";
import themes from "../styles/themes";
import { useSelector } from "react-redux";
import Store from "../store/types";

let scrollView;

const onSharePress = ({ title = "spectrum-lnd-logs", message = "" }): void => {
	try {
		Share.share({
			message,
			title
		}, {
			dialogTitle: title
		});
	} catch {}
};

interface ILogBox {
	data: string[];
}

const LogBox = ({ data = [] }: ILogBox) => {
	const settings = useSelector((state: Store) => state.settings);
	const theme = themes[settings.theme];

	return (
		<View type="transparent" style={styles.logBoxContainer}>
			<ScrollView
				ref={ref => scrollView = ref}
				onContentSizeChange={() => {
					try {scrollView.scrollToEnd({ animated: true });} catch {}
				}}
				contentContainerStyle={styles.logBox}
			>
				{data.map((line, index) => <Text key={index} style={[styles.logBoxText, { color: theme.colors.logText }]}>{line}</Text>)}
				<View style={{ height: 100 }} />
			</ScrollView>
			<Button style={styles.shareButton} text="Share" onPress={() => onSharePress({ message: data.join("\n") })} />
		</View>
	);
};

const styles = StyleSheet.create({
	logBoxContainer: {
		flex: 1,
	},
	logBox: {
		alignItems: "flex-start",
		justifyContent: "flex-end",
		marginHorizontal: 10,
		paddingBottom: 10
	},
	logBoxText: {
		textAlign: "left",
		fontSize: 12
	},
	shareButton: {
		position: "absolute",
		bottom: 0,
		padding: 8
	}
});


export default LogBox;
