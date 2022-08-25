import React, {
	memo,
	ReactElement,
	useMemo,
	useState,
	useEffect,
	useRef,
	MutableRefObject,
} from 'react';
import { useSelector } from 'react-redux';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import QRCode from 'react-native-qrcode-svg';
import { FadeIn, FadeOut } from 'react-native-reanimated';
import Clipboard from '@react-native-clipboard/clipboard';
import Share from 'react-native-share';

import {
	View as ThemedView,
	CopyIcon,
	ShareIcon,
	TouchableOpacity,
	AnimatedView,
} from '../../../styles/components';
import Store from '../../../store/types';
import { resetInvoice } from '../../../store/actions/receive';
import { updateMetaIncTxTags } from '../../../store/actions/metadata';
import { getReceiveAddress, getNewReceiveAddress } from '../../../utils/wallet';
import { getUnifiedUri } from '../../../utils/receive';
import { createLightningInvoice } from '../../../utils/lightning';
import NavigationHeader from '../../../components/NavigationHeader';
import Button from '../../../components/Button';
import Tooltip from '../../../components/Tooltip';

const bitcoinLogo = require('../../../assets/bitcoin-logo.png');

const Receive = ({ navigation }): ReactElement => {
	const insets = useSafeAreaInsets();
	const dimensions = useWindowDimensions();
	const { amount, message, tags } = useSelector(
		(store: Store) => store.receive,
	);
	const [showCopy, setShowCopy] = useState(false);
	const [lightningInvoice, setLightningInvoice] = useState('');
	const qrRef = useRef<object>(null);

	const buttonContainer = useMemo(
		() => ({
			...styles.buttonContainer,
			paddingBottom: insets.bottom + 10,
		}),
		[insets.bottom],
	);

	useEffect(() => {
		resetInvoice();
	}, []);

	const receiveAddress = useMemo(() => {
		if (amount > 0) {
			console.info('getting fresh address');
			const response = getNewReceiveAddress({});

			if (response.isOk()) {
				return response.value;
			}
		} else {
			const response = getReceiveAddress({});

			if (response.isOk()) {
				console.info(`reusing address ${response.value}`);
				return response.value;
			}
		}
	}, [amount]);

	useEffect(() => {
		const getLightningInvoice = async (): Promise<void> => {
			const response = await createLightningInvoice({
				amountSats: amount,
				description: message,
				expiryDeltaSeconds: 180,
			});

			// TODO: add error handling

			if (response.isOk()) {
				setLightningInvoice(response.value.to_str);
			}
		};
		getLightningInvoice();
	}, [amount, message]);

	useEffect(() => {
		if (tags.length !== 0 && receiveAddress) {
			updateMetaIncTxTags(receiveAddress, lightningInvoice, tags);
		}
	}, [receiveAddress, lightningInvoice, tags]);

	// Getting receive address shouldn't take long, so we don't show a spinner
	// TODO: add error handling
	if (!receiveAddress) {
		return <></>;
	}

	const uri = getUnifiedUri({
		bitcoin: receiveAddress,
		amount,
		label: message,
		message,
		lightning: lightningInvoice,
	});

	const handleCopy = (): void => {
		setShowCopy(() => true);
		setTimeout(() => setShowCopy(() => false), 1200);
		Clipboard.setString(uri);
	};

	const handleShare = (): void => {
		const url = `data:image/png;base64,${qrRef.current}`;

		try {
			Share.open({
				title: 'Share receiving address',
				message: uri,
				url,
				type: 'image/png',
			});
		} catch (e) {
			console.log(e);
		}
	};

	const qrMaxHeight = dimensions.height / 2.5;
	const qrMaxWidth = dimensions.width - 16 * 4;
	const qrSize = Math.min(qrMaxWidth, qrMaxHeight);

	return (
		<ThemedView color="onSurface" style={styles.container}>
			<NavigationHeader
				displayBackButton={false}
				title="Receive Bitcoin"
				size="sm"
			/>
			<View style={styles.qrCodeContainer}>
				<TouchableOpacity
					color="white"
					activeOpacity={1}
					onPress={handleCopy}
					style={styles.qrCode}>
					<QRCode
						logo={bitcoinLogo}
						logoSize={70}
						logoBackgroundColor="white"
						logoBorderRadius={100}
						logoMargin={11}
						value={uri}
						size={qrSize}
						getRef={(c): void => {
							if (!c || !qrRef) {
								return;
							}
							c.toDataURL(
								(data) => ((qrRef as MutableRefObject<object>).current = data),
							);
						}}
					/>
				</TouchableOpacity>

				{showCopy && (
					<AnimatedView
						entering={FadeIn.duration(500)}
						exiting={FadeOut.duration(500)}
						color="transparent"
						style={styles.tooltip}>
						<Tooltip text="Invoice Copied To Clipboard" />
					</AnimatedView>
				)}
			</View>
			<View style={styles.row}>
				<Button
					icon={<CopyIcon width={18} color="brand" />}
					text="Copy"
					onPress={handleCopy}
				/>
				<View style={styles.buttonSpacer} />
				<Button
					icon={<ShareIcon width={18} color="brand" />}
					text="Share"
					onPress={handleShare}
				/>
			</View>
			<View style={buttonContainer}>
				<Button
					size="lg"
					text="Specify Amount or Add Note"
					onPress={(): void => navigation.navigate('ReceiveDetails')}
				/>
			</View>
		</ThemedView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		paddingHorizontal: 16,
	},
	qrCodeContainer: {
		alignItems: 'center',
		marginVertical: 32,
	},
	qrCode: {
		borderRadius: 10,
		padding: 16,
		position: 'relative',
	},
	tooltip: {
		position: 'absolute',
		top: '68%',
	},
	row: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
	},
	buttonSpacer: {
		width: 16,
	},
	buttonContainer: {
		flex: 1,
		justifyContent: 'flex-end',
		minHeight: 100,
	},
});

export default memo(Receive);
