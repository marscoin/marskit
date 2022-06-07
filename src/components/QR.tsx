import React, { memo, ReactElement, useState } from 'react';
import { LayoutAnimation, Share, StyleSheet } from 'react-native';
import { FadeIn, FadeOut } from 'react-native-reanimated';
import QRCode from 'react-native-qrcode-svg';
import Animated, { EasingNode } from 'react-native-reanimated';
import Clipboard from '@react-native-clipboard/clipboard';
import { RouteProp } from '@react-navigation/native';

import { showErrorNotification } from '../utils/notifications';
import Button from './Button';
import {
	AnimatedView,
	Caption13S,
	CopyIcon,
	ShareIcon,
	TouchableOpacity,
	View,
} from '../styles/components';

interface IReceive {
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
	const [textOpacity] = useState(new Animated.Value(0));

	if (!data) {
		try {
			if (route?.params?.data) {
				data = route.params.data;
			}
		} catch {}
	}

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
				easing: EasingNode.inOut(EasingNode.ease),
			}).start(async () => {
				setTimeout(() => {
					Animated.timing(textOpacity, {
						toValue: 0,
						duration,
						easing: EasingNode.inOut(EasingNode.ease),
					}).start();
				}, duration / 4);
			});
		} catch (e) {
			console.log(e);
			showErrorNotification({
				title: 'Unable to copy item to clipboard.',
				message: "Please try again or check your phone's permissions.",
			});
		}
	};

	return (
		<View color="transparent">
			<AnimatedView
				style={styles.container}
				entering={FadeIn.duration(1000)}
				exiting={FadeOut}>
				<View color="surface" style={styles.content}>
					<TouchableOpacity
						color="text"
						activeOpacity={1}
						onPress={onCopyPress}
						style={styles.qrCode}>
						{!!data && <QRCode value={data} size={200} />}
					</TouchableOpacity>

					{displayText && (
						<View color="transparent" style={styles.textContainer}>
							<Caption13S style={styles.text} color="white5">
								{data}
							</Caption13S>
							<AnimatedView
								color="transparent"
								style={[styles.copiedContainer, { opacity: textOpacity }]}>
								<View color={'onSurface'} style={styles.copySuccessContainer}>
									<View color="transparent" style={styles.copied}>
										<Caption13S color="white5" style={styles.copiedText}>
											{onCopySuccessText}
										</Caption13S>
									</View>
								</View>
							</AnimatedView>
						</View>
					)}
					<View style={styles.row}>
						<Button
							icon={<CopyIcon height={18} color="brand" />}
							text="Copy"
							onPress={onCopyPress}
							disabled={!data || disabled}
						/>
						<View style={styles.buttonSpacer} />
						<Button
							icon={<ShareIcon height={18} color="brand" />}
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
	},
	textContainer: {
		borderRadius: 5,
		alignItems: 'center',
		justifyContent: 'center',
		marginVertical: 16,
		width: 220,
	},
	text: {
		textAlign: 'center',
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
