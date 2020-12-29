import React, { ReactElement } from 'react';
import { View } from '../../styles/components';
import { Alert, StyleSheet } from 'react-native';
import Camera from '../../components/Camera';
import {
	showErrorNotification,
	showInfoNotification,
	showSuccessNotification,
} from '../../utils/notifications';
import { decodeQRData, EQRDataType, QRData } from '../../utils/scanner';
import { useSelector } from 'react-redux';
import Store from '../../store/types';
import { payLightningRequest } from '../../store/actions/lightning';

const ScannerScreen = ({ navigation }): ReactElement => {
	const selectedNetwork = useSelector(
		(state: Store) => state.wallet.selectedNetwork,
	);

	const handleOnQRData = async (data: QRData): Promise<void> => {
		if (data.network !== selectedNetwork) {
			return showErrorNotification({
				title: 'Unsupported network',
				message: `App is currently set to ${selectedNetwork} but QR is for ${data.network}.`,
			});
		}

		switch (data.qrDataType) {
			case EQRDataType.bitcoinAddress: {
				//TODO
				showInfoNotification({
					title: 'TODO: Implement me',
					message: 'Address payments not yet working.',
				});
				break;
			}
			case EQRDataType.lightningPaymentRequest: {
				Alert.alert(
					`Pay ${data.sats} sats?`,
					data.message,
					[
						{
							text: 'Cancel',
							onPress: (): void => {},
							style: 'cancel',
						},
						{
							text: 'Pay',
							onPress: async (): Promise<void> => {
								const payRes = await payLightningRequest(
									data.lightningPaymentRequest ?? '',
								);
								if (payRes.isErr()) {
									showErrorNotification({
										title: 'Payment failed',
										message: payRes.error.message,
									});
									return;
								}

								showSuccessNotification({
									title: 'Paid!',
									message: `${data.sats} sats`,
								});
							},
						},
					],
					{ cancelable: true },
				);

				break;
			}
		}
	};

	const onBarCodeRead = async (data): Promise<void> => {
		navigation.pop();

		const res = await decodeQRData(data);

		if (res.isErr() || (res.isOk() && res.value.length === 0)) {
			showErrorNotification({
				title: 'Scanning failed',
				message: 'QR code not supported',
			});
			return;
		}

		const qrData = res.value;
		if (qrData.length === 1) {
			return await handleOnQRData(qrData[0]);
		} else {
			//Multiple payment requests, like bitcoin and lightning in on QR. Show them the options they have and then handle the selected one.
			Alert.alert('How would you like to pay?', '', [
				{
					text: 'Cancel',
					onPress: (): void => {},
					style: 'cancel',
				},
				...qrData.map((selectedOption) => {
					return {
						text: selectedOption.qrDataType,
						onPress: async (): Promise<void> =>
							await handleOnQRData(selectedOption),
					};
				}),
			]);
		}
	};

	return (
		<View style={styles.container}>
			<Camera onBarCodeRead={onBarCodeRead} onClose={(): void => {}} />
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
});

export default ScannerScreen;
