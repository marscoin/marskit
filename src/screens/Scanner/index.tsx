import React, { ReactElement } from 'react';
import { View } from '../../styles/components';
import { Alert, StyleSheet } from 'react-native';
import Camera from '../../components/Camera';
import { showErrorNotification } from '../../utils/notifications';
import { decodeQRData, handleData } from '../../utils/scanner';
import { useSelector } from 'react-redux';
import Store from '../../store/types';
import Button from '../../components/Button';
import SafeAreaView from '../../components/SafeAreaView';

const ScannerScreen = ({ navigation }): ReactElement => {
	const selectedNetwork = useSelector(
		(state: Store) => state.wallet.selectedNetwork,
	);
	const selectedWallet = useSelector(
		(state: Store) => state.wallet.selectedWallet,
	);

	const onRead = async (data): Promise<void> => {
		const res = await decodeQRData(data);

		if (res.isErr() || (res.isOk() && res.value.length === 0)) {
			showErrorNotification(
				{
					title: 'Error',
					message: 'Failed to detect any readable data',
				},
				'bottom',
			);
			return;
		}

		navigation.pop();

		const qrData = res.value;
		if (qrData.length === 1) {
			return await handleData({
				data: qrData[0],
				selectedNetwork,
				selectedWallet,
			});
		} else {
			//Multiple payment requests, like bitcoin and lightning in on QR. Show them the options they have and then handle the selected one.
			Alert.alert('How would you like to pay?', '', [
				{
					text: 'Cancel',
					onPress: (): void => {},
					style: 'cancel',
				},
				...qrData.map((selectedOption) => ({
					text: selectedOption.qrDataType,
					onPress: async (): Promise<void> =>
						await handleData({
							data: selectedOption,
							selectedNetwork,
							selectedWallet,
						}),
				})),
			]);
		}
	};

	return (
		<SafeAreaView>
			<Camera onBarCodeRead={onRead} onClose={(): void => {}}>
				<View color={'transparent'} style={styles.scannerView}>
					<Button
						style={styles.pasteButton}
						text={'Paste from clipboard'}
						onPress={onRead}
					/>
				</View>
			</Camera>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	scannerView: {
		flex: 1,
		justifyContent: 'flex-end',
	},
	pasteButton: {
		marginBottom: 20,
	},
});

export default ScannerScreen;
