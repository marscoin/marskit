import React, { ReactElement } from 'react';
import { Text, TouchableOpacity, View } from '../../styles/components';
import { StyleSheet } from 'react-native';
import Camera from '../../components/Camera';
import {
	showErrorNotification,
	showInfoNotification,
} from '../../utils/notifications';
import lnd from 'react-native-lightning';

const ScannerScreen = ({ navigation }): ReactElement => {
	const onBarCodeRead = async (data): Promise<void> => {
		console.log('\n\n\n\n\n\n********\n');
		console.log(data);
		navigation.pop();

		const lightningRes = await lnd.decodeInvoice(
			data.replace('lightning:', ''),
		);

		if (lightningRes.isOk()) {
			showInfoNotification({
				title: 'Lightning invoice',
				message: `Pay ${lightningRes.value.numSatoshis}?`,
			});
			return;
		}

		//TODO validate if the QR contains a bitcoin address

		showErrorNotification({
			title: 'Failed to decode invoice',
			message: lightningRes.error.message,
		});
	};

	return (
		<View style={styles.container}>
			<Camera
				onBarCodeRead={onBarCodeRead}
				onClose={(): void => {
					showInfoNotification({ title: 'closed', message: 'closed' });
				}}
			/>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
});

export default ScannerScreen;
