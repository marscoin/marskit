import React, { ReactElement } from 'react';
import { BlurView } from '@react-native-community/blur';
import { ToastConfig, ToastConfigParams } from 'react-native-toast-message';
import LinearGradient from 'react-native-linear-gradient';
import {
	View,
	StyleSheet,
	StyleProp,
	ViewStyle,
	Platform,
	useWindowDimensions,
} from 'react-native';

import colors from '../styles/colors';
import { Text01M, Text13S } from '../styles/components';

type BlurViewProps = {
	style: StyleProp<ViewStyle>;
	[x: string]: any;
};

const Blur = ({ style, ...props }: BlurViewProps): ReactElement => {
	return Platform.OS === 'ios' ? (
		<BlurView {...props} style={style} />
	) : (
		<View {...props} style={[style, styles.containerAndroid]} />
	);
};

const Toast = ({
	type,
	text1,
	text2,
}: ToastConfigParams<any>): ReactElement => {
	const dimensions = useWindowDimensions();

	let titleColor = 'white';
	let gradientColor = colors.black;

	if (type === 'success') {
		titleColor = 'green';
		gradientColor = '#1d2f1c';
	}

	if (type === 'info') {
		titleColor = 'blue';
		gradientColor = '#00294e';
	}

	if (type === 'error') {
		titleColor = 'brand';
		gradientColor = '#552200';
	}

	return (
		<LinearGradient
			start={{ x: 1, y: 0 }}
			end={{ x: 0, y: 0 }}
			colors={['rgba(0, 15, 28, 0.5)', gradientColor]}
			locations={[0, 0.5]}
			style={[{ width: dimensions.width - 16 * 2 }, styles.linearGradient]}>
			<Blur style={styles.container}>
				<Text01M color={titleColor}>{text1}</Text01M>
				<Text13S style={styles.description} color="gray1">
					{text2}
				</Text13S>
			</Blur>
		</LinearGradient>
	);
};

const styles = StyleSheet.create({
	linearGradient: {
		borderRadius: 8,
	},
	container: {
		borderRadius: 8,
		padding: 16,
	},
	containerAndroid: {
		backgroundColor: 'rgba(30, 30, 30, 0.7)',
	},
	description: {
		marginTop: 3,
	},
});

export const toastConfig: ToastConfig = {
	success: (props) => <Toast {...props} />,
	info: (props) => <Toast {...props} />,
	error: (props) => <Toast {...props} />,
};
