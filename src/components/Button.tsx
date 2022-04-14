/**
 * @format
 * @flow strict-local
 */
import React, { memo, ReactElement } from 'react';
import { StyleSheet, ActivityIndicator } from 'react-native';
import { Text01M, TouchableOpacity, View } from '../styles/components';

interface IButton {
	text: string;
	color?: string;
	onPress?: Function;
	onLongPress?: Function;
	disabled?: boolean;
	loading?: boolean;
	icon?: ReactElement;
	style?: Object;
	textStyle?: Object;
}
const Button = ({
	text = '',
	color = 'background',
	onPress = (): null => null,
	onLongPress = (): null => null,
	disabled = false,
	loading = false,
	icon = undefined,
	style = {},
	textStyle = {},
}: IButton): ReactElement => {
	return (
		<TouchableOpacity
			activeOpacity={0.6}
			color={color}
			style={[styles.button, style, { opacity: disabled ? 0.2 : 1 }]}
			onPress={onPress}
			onLongPress={onLongPress}
			disabled={disabled}>
			{icon ? (
				<View style={styles.iconContainer} color={'transparent'}>
					{icon}
				</View>
			) : null}
			<Text01M style={[styles.text, textStyle]}>{text}</Text01M>
			{loading && (
				<View color="onSurface" style={styles.loading}>
					<ActivityIndicator size="small" />
				</View>
			)}
		</TouchableOpacity>
	);
};

const styles = StyleSheet.create({
	button: {
		alignItems: 'center',
		justifyContent: 'center',
		borderRadius: 10,
		paddingVertical: 5,
		shadowColor: 'rgba(0, 0, 0, 0.1)',
		shadowOpacity: 0.8,
		elevation: 6,
		shadowRadius: 15,
		shadowOffset: { width: 1, height: 13 },
		minWidth: 110,
		marginVertical: 5,
		paddingHorizontal: 10,
		display: 'flex',
		flexDirection: 'row',
	},
	text: {},
	iconContainer: {
		marginRight: 6,
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

export default memo(Button);
