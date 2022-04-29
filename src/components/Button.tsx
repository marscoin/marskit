import React, { memo, ReactElement, useMemo } from 'react';
import { StyleSheet, ActivityIndicator } from 'react-native';
import {
	Caption13M,
	Text02M,
	TouchableOpacity,
	View,
} from '../styles/components';
import useColors from '../hooks/colors';

interface IButton {
	text: string;
	color?: string;
	variant?: string;
	size?: string;
	disabled?: boolean;
	loading?: boolean;
	icon?: ReactElement;
	style?: Object;
	textStyle?: Object;
}
const Button = ({
	text = '',
	color,
	variant = 'primary',
	size = 'small',
	disabled = false,
	loading = false,
	textStyle = {},
	style,
	icon,
	...props
}: IButton): ReactElement => {
	const { white08 } = useColors();

	const buttonStyle = useMemo(() => {
		return StyleSheet.compose(
			{
				...styles.buttonBase,
				...(size === 'small' ? styles.buttonSmall : styles.buttonLarge),
				...(variant === 'primary'
					? styles.buttonPrimary
					: { ...styles.buttonSecondary, borderColor: white08 }),
				opacity: disabled ? 0.5 : 1,
			},
			style,
		);
	}, [variant, size, disabled, white08, style]);

	const buttonColor = useMemo(() => {
		if (color) {
			return color;
		}
		return variant === 'primary' ? 'white08' : 'transparent';
	}, [color, variant]);

	const Text = size === 'small' ? Caption13M : Text02M;

	return (
		<TouchableOpacity
			activeOpacity={0.6}
			color={buttonColor}
			style={buttonStyle}
			disabled={disabled}
			{...props}>
			{icon ? (
				<View style={styles.iconContainer} color={'transparent'}>
					{icon}
				</View>
			) : null}
			<Text style={textStyle}>{text}</Text>
			{loading && (
				<View color="onSurface" style={styles.loading}>
					<ActivityIndicator size="small" />
				</View>
			)}
		</TouchableOpacity>
	);
};

const styles = StyleSheet.create({
	buttonBase: {
		alignItems: 'center',
		justifyContent: 'center',
		flexDirection: 'row',
		shadowColor: 'rgba(0, 0, 0, 0.1)',
		shadowOpacity: 0.8,
		elevation: 6,
		shadowRadius: 15,
		shadowOffset: { width: 1, height: 13 },
	},
	buttonSmall: {
		height: 36,
		borderRadius: 54,
		paddingHorizontal: 16,
		minWidth: 110,
	},
	buttonLarge: {
		height: 56,
		borderRadius: 64,
		paddingHorizontal: 28,
		minWidth: 110,
	},
	buttonPrimary: {},
	buttonSecondary: {
		borderWidth: 2,
	},
	iconContainer: {
		marginRight: 6,
	},
	loading: {
		...StyleSheet.absoluteFillObject,
		alignItems: 'center',
		justifyContent: 'center',
		alignSelf: 'center',
		borderRadius: 54,
		paddingVertical: 12,
		paddingHorizontal: 16,
		shadowColor: 'rgba(0, 0, 0, 0.1)',
		shadowOpacity: 0.8,
		elevation: 6,
		shadowRadius: 15,
		shadowOffset: { width: 1, height: 13 },
	},
});

export default memo(Button);
