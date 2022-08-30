import React, { ReactElement } from 'react';
import { BlurView } from '@react-native-community/blur';
import { ToastConfig, ToastConfigParams } from 'react-native-toast-message';
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
		<BlurView {...props} style={[style, styles.containerIos]} />
	) : (
		<View {...props} style={[style, styles.containerAndroid]} />
	);
};

const isAndroid = Platform.OS === 'android';
const isIos = Platform.OS === 'ios';

const Toast = ({
	type,
	text1,
	text2,
}: ToastConfigParams<any>): ReactElement => {
	const dimensions = useWindowDimensions();

	let typeStyle = {};

	if (type === 'success') {
		typeStyle = {
			...(isAndroid ? { borderColor: colors.green } : {}),
			...(isIos ? { backgroundColor: 'rgba(0, 255, 90, 0.3)' } : {}),
		};
	}

	if (type === 'info') {
		typeStyle = {
			...(isAndroid ? { borderColor: colors.indigo } : {}),
			...(isIos ? { backgroundColor: 'rgba(0, 90, 255, 0.3)' } : {}),
		};
	}

	if (type === 'error') {
		typeStyle = {
			...(isAndroid ? { borderColor: colors.red } : {}),
			...(isIos ? { backgroundColor: 'rgba(255, 90, 0, 0.3)' } : {}),
		};
	}

	return (
		<Blur
			style={[
				{ width: dimensions.width - 16 * 2 },
				styles.container,
				typeStyle,
			]}>
			<Text01M style={styles.title} color="brand">
				{text1}
			</Text01M>
			<Text13S style={styles.description} color="gray1">
				{text2}
			</Text13S>
		</Blur>
	);
};

const styles = StyleSheet.create({
	container: {
		borderRadius: 8,
		borderLeftWidth: 3,
		padding: 16,
	},
	containerIos: {},
	containerAndroid: {
		backgroundColor: 'white',
	},
	title: {},
	description: {
		marginTop: 3,
	},
});

export const toastConfig: ToastConfig = {
	success: (props) => <Toast {...props} />,
	info: (props) => <Toast {...props} />,
	error: (props) => <Toast {...props} />,
};
