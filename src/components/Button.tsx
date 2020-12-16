/**
 * @format
 * @flow strict-local
 */
import React from 'react';
import { StyleSheet, ActivityIndicator } from 'react-native';
import { Pressable, Text, View } from '../styles/components';

interface IButton {
	text: string;
	color?: string;
	onPress?: Function;
	onLongPress?: Function;
	disabled?: boolean;
	loading?: boolean;
	style?: Object;
}
const Button = ({
	text = '',
	color = 'background',
	onPress = () => null,
	onLongPress = () => null,
	disabled = false,
	loading = false,
	style = {},
}: IButton) => {
	return (
		<Pressable
			color={color}
			style={[styles.button, style]}
			//@ts-ignore
			onPress={onPress}
			//@ts-ignore
			onLongPress={onLongPress}
			disabled={disabled}>
			<Text style={styles.text}>{text}</Text>
			{loading && (
				<View color="onSurface" style={styles.loading}>
					<ActivityIndicator size="small" />
				</View>
			)}
		</Pressable>
	);
};

const styles = StyleSheet.create({
	button: {
		alignItems: 'center',
		justifyContent: 'center',
		alignSelf: 'center',
		borderRadius: 10,
		paddingVertical: 5,
		shadowColor: 'rgba(0, 0, 0, 0.1)',
		shadowOpacity: 0.8,
		elevation: 6,
		shadowRadius: 15,
		shadowOffset: { width: 1, height: 13 },
		minWidth: 110,
		marginVertical: 5,
	},
	text: {
		fontSize: 14,
		fontWeight: 'bold',
		textAlign: 'center',
		paddingVertical: 8,
	},
	loading: {
		...StyleSheet.absoluteFillObject,
		alignItems: 'center',
		justifyContent: 'center',
		alignSelf: 'center',
		borderRadius: 10,
		paddingVertical: 5,
		shadowColor: 'rgba(0, 0, 0, 0.1)',
		shadowOpacity: 0.8,
		elevation: 6,
		shadowRadius: 15,
		shadowOffset: { width: 1, height: 13 },
	},
});

export default Button;
