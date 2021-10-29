import React, { memo, ReactElement, useEffect, useState } from 'react';
import { LayoutAnimation, Share, StyleSheet } from 'react-native';
import {
	View,
	Text,
	AnimatedView,
	TouchableOpacity,
	Feather,
	AntDesign,
} from '../styles/components';
import QRCode from 'react-native-qrcode-svg';
import Animated, { Easing } from 'react-native-reanimated';
import NavigationHeader from './NavigationHeader';
import Button from './Button';
import { systemWeights } from 'react-native-typography';
import Clipboard from '@react-native-community/clipboard';
import { RouteProp } from '@react-navigation/native';

const updateOpacity = ({
	opacity = new Animated.Value(0),
	toValue = 0,
	duration = 1000,
}): void => {
	try {
		Animated.timing(opacity, {
			toValue,
			duration,
			easing: Easing.inOut(Easing.ease),
		}).start();
	} catch {}
};

interface IReceive {
	animate?: boolean;
	header?: boolean;
	headerTitle?: string;
	data: string;
	displayText?: boolean;
	shareMessage?: string;
	shareUrl?: string;
	shareTitle?: string;
	shareDialogTitle?: string;
	onCopySuccessText?: string;
	disabled?: boolean;
	route?: RouteProp<
		{ params: { data: string; headerTitle: string } },
		'params'
	>;
}
const QR = ({
	animate = true,
	header = true,
	headerTitle = 'Receive',
	data = '',
	displayText = true,
	shareMessage = '',
	shareUrl = '',
	shareTitle = '',
	shareDialogTitle = '',
	onCopySuccessText = 'Copied!',
	disabled = false,
	route,
}: IReceive): ReactElement => {
	const [opacity] = useState(new Animated.Value(0));
	const [textOpacity] = useState(new Animated.Value(0));

	if (!data) {
		try {
			if (route?.params?.data) {
				data = route.params.data;
			}
			if (route?.params.headerTitle) {
				headerTitle = route.params.headerTitle;
			}
		} catch {}
	}

	useEffect(() => {
		if (animate) {
			setTimeout(() => {
				updateOpacity({ opacity, toValue: 1 });
			}, 100);
			return (): void => updateOpacity({ opacity, toValue: 0, duration: 0 });
		}
	}, [animate, opacity]);

	LayoutAnimation.easeInEaseOut();

	const onSharePress = (): void => {
		try {
			Share.share(
				{
					message: shareMessage,
					url: shareUrl,
					title: shareTitle,
				},
				{
					dialogTitle: shareDialogTitle, // Android only
				},
			);
		} catch (e) {
			console.log(e);
		}
	};

	const onCopyPress = (): void => {
		let duration = 1500;
		try {
			Clipboard.setString(data);
			Animated.timing(textOpacity, {
				toValue: 1,
				duration: 500,
				easing: Easing.inOut(Easing.ease),
			}).start(async () => {
				setTimeout(() => {
					Animated.timing(textOpacity, {
						toValue: 0,
						duration,
						easing: Easing.inOut(Easing.ease),
					}).start();
				}, duration / 4);
			});
		} catch (e) {
			console.log(e);
			console.log(
				"Unable to copy item to clipboard. Please try again or check your phone's permissions.",
			);
		}
	};

	return (
		<View
			color={header ? 'background' : 'transparent'}
			//eslint-disable-next-line react-native/no-inline-styles
			style={{ flex: header ? 1 : 0 }}>
			{header && <NavigationHeader title={headerTitle} />}
			<AnimatedView style={[styles.container, { opacity }]}>
				<View color={header ? 'background' : 'surface'} style={styles.content}>
					<TouchableOpacity
						color="text"
						activeOpacity={1}
						onPress={onCopyPress}
						style={styles.qrCode}>
						{!!data && <QRCode value={data} size={200} />}
					</TouchableOpacity>

					{displayText && (
						<View color="transparent" style={styles.textContainer}>
							<Text style={styles.text}>{data}</Text>
							<AnimatedView
								color="transparent"
								style={[styles.copiedContainer, { opacity: textOpacity }]}>
								<View color={'onSurface'} style={styles.copySuccessContainer}>
									<View color="transparent" style={styles.copied}>
										<Text style={styles.copiedText}>{onCopySuccessText}</Text>
									</View>
								</View>
							</AnimatedView>
						</View>
					)}
					<View style={styles.row}>
						<Button
							icon={<Feather name={'copy'} size={18} color="text" />}
							color={header ? 'onSurface' : 'background'}
							text="Copy"
							onPress={onCopyPress}
							disabled={!data || disabled}
						/>
						<View style={styles.buttonSpacer} />
						<Button
							icon={<AntDesign name={'arrowup'} size={20} color="text" />}
							color={header ? 'onSurface' : 'background'}
							text="Share"
							onPress={onSharePress}
							disabled={!data || disabled}
						/>
					</View>
				</View>
			</AnimatedView>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		backgroundColor: 'transparent',
	},
	content: {
		alignItems: 'center',
		backgroundColor: 'transparent',
	},
	qrCode: {
		padding: 10,
		borderRadius: 15,
	},

	textContainer: {
		borderRadius: 5,
		alignItems: 'center',
		justifyContent: 'center',
		padding: 10,
		marginVertical: 20,
	},
	text: {
		...systemWeights.semibold,
		fontSize: 15,
		textAlign: 'center',
		fontWeight: 'bold',
	},
	copiedContainer: {
		flex: 1,
		position: 'absolute',
		left: -2,
		top: -2,
		bottom: -2,
		right: -2,
	},
	copied: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
	},
	copiedText: {
		fontSize: 16,
		textAlign: 'center',
	},
	copySuccessContainer: {
		flex: 1,
		borderRadius: 10,
	},
	row: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: 'transparent',
	},
	buttonSpacer: {
		marginHorizontal: 5,
	},
});

export default memo(QR);
