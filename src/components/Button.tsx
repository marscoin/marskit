/**
 * @format
 * @flow strict-local
 */
import React from 'react';
import { StyleSheet, Text, Pressable } from 'react-native';

const Button = ({
	text = '',
	onPress = () => null,
	style = {},
}: {
	text: string;
	onPress?: Function;
	style?: Object;
}) => {
	return (
		<Pressable
			style={[styles.button, style]}
			//@ts-ignore
			onPress={onPress}>
			<Text style={styles.text}>{text}</Text>
		</Pressable>
	);
};

const styles = StyleSheet.create({
	button: {
		alignItems: 'center',
		justifyContent: 'center',
		alignSelf: 'center',
		borderRadius: 25,
		paddingTop: 5,
		paddingBottom: 5,
		paddingHorizontal: 20,
		backgroundColor: '#FFFFFF',
		shadowColor: 'rgba(0, 0, 0, 0.1)',
		shadowOpacity: 0.8,
		elevation: 6,
		shadowRadius: 15,
		shadowOffset: { width: 1, height: 13 },
		minWidth: 150,
		marginVertical: 20,
	},
	text: {
		fontSize: 20,
		color: 'black',
		fontWeight: 'bold',
		textAlign: 'center',
		padding: 15,
	},
});

export default Button;
