/**
 * @format
 * @flow strict-local
 */

//TODO: Temporary component for testing and demonstration purposes. Remove or change after use.

import React, { memo, useEffect, useState } from 'react';
import { LayoutAnimation, Share, StyleSheet } from 'react-native';
import {
	View,
	Text,
	AnimatedView,
	TouchableOpacity,
} from '../../styles/components';
import QRCode from 'react-native-qrcode-svg';
import Animated, { Easing } from 'react-native-reanimated';
import { useSelector } from 'react-redux';
import Store from '../../store/types';
import NavigationHeader from '../../components/NavigationHeader';
import Button from '../../components/Button';
import { systemWeights } from 'react-native-typography';
import Clipboard from '@react-native-community/clipboard';

const updateOpacity = ({
	opacity = new Animated.Value(0),
	toValue = 0,
	duration = 1000,
}) => {
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
	text?: string;
	shareMessage?: string;
	shareUrl?: string;
	shareTitle?: string;
	shareDialogTitle?: string;
	onCopySuccessText?: string;
	disabled?: boolean;
}
const Receive = ({
	animate = true,
	header = true,
	text = '',
	shareMessage = '',
	shareUrl = '',
	shareTitle = '',
	shareDialogTitle = '',
	onCopySuccessText = 'Copied!',
	disabled = false,
}: IReceive) => {
	const wallet = useSelector((state: Store) => state.wallet);
	const [opacity] = useState(new Animated.Value(0));
	const [textOpacity] = useState(new Animated.Value(0));

	const { selectedWallet, selectedNetwork } = wallet;
	const addresses = wallet.wallets[selectedWallet].addresses[selectedNetwork];
	const key = Object.keys(addresses)[0];
	const address = addresses[key].address;

	useEffect(() => {
		if (animate) {
			setTimeout(() => {
				updateOpacity({ opacity, toValue: 1 });
			}, 100);
			return () => updateOpacity({ opacity, toValue: 0, duration: 0 });
		}
	}, []);

	LayoutAnimation.easeInEaseOut();

	const onSharePress = () => {
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

	const onCopyPress = () => {
		let duration = 1500;
		try {
			Clipboard.setString(text);
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
			color={header ? 'background' : 'surface'}
			style={{ flex: header ? 1 : 0 }}>
			{header && <NavigationHeader title="Receive" />}
			<AnimatedView style={[styles.container, { opacity }]}>
				<View color={header ? 'background' : 'surface'} style={styles.content}>
					<TouchableOpacity
						activeOpacity={1}
						onPress={onCopyPress}
						color="onSurface"
						style={styles.qrCode}>
						<QRCode value={address} size={200} />
					</TouchableOpacity>

					<View color="transparent" style={styles.textContainer}>
						<Text style={styles.text}>{address}</Text>
						<AnimatedView
							color="transparent"
							style={[styles.copiedContainer, { opacity: textOpacity }]}>
							<View
								color={header ? 'background' : 'surface'}
								style={styles.copySuccessContainer}>
								<View color="transparent" style={styles.copied}>
									<Text style={styles.copiedText}>{onCopySuccessText}</Text>
								</View>
							</View>
						</AnimatedView>
					</View>
					<View style={styles.row}>
						<Button
							color={header ? 'onSurface' : 'background'}
							text="Share"
							onPress={onSharePress}
							disabled={!address || disabled}
						/>
						<View style={styles.buttonSpacer} />
						<Button
							color={header ? 'onSurface' : 'background'}
							text="Copy"
							onPress={onCopyPress}
							disabled={!address || disabled}
						/>
					</View>
				</View>
			</AnimatedView>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		marginVertical: 20,
	},
	content: {
		alignItems: 'center',
	},
	qrCode: {
		padding: 12,
		borderRadius: 15,
	},

	textContainer: {
		borderRadius: 5,
		alignItems: 'center',
		justifyContent: 'center',
		padding: 10,
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
		marginTop: 5,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: 'transparent',
	},
	buttonSpacer: {
		marginHorizontal: 5,
	},
});

export default memo(Receive);
