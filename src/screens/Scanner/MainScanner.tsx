import React, { memo, ReactElement } from 'react';
import { StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';

import { processInputData } from '../../utils/scanner';
import Store from '../../store/types';
import SafeAreaInsets from '../../components/SafeAreaInsets';
import NavigationHeader from '../../components/NavigationHeader';
import { showErrorNotification } from '../../utils/notifications';
import ScannerComponent from './ScannerComponent';

const ScannerScreen = ({ navigation }): ReactElement => {
	const selectedNetwork = useSelector(
		(state: Store) => state.wallet.selectedNetwork,
	);
	const selectedWallet = useSelector(
		(state: Store) => state.wallet.selectedWallet,
	);

	const onRead = async (data): Promise<void> => {
		if (!data) {
			showErrorNotification({
				title: 'No Data Detected',
				message: 'Sorry. Bitkit is not able to read this QR code.',
			});
			return;
		}
		navigation.pop();
		processInputData({
			data,
			selectedNetwork,
			selectedWallet,
		}).then();
	};

	return (
		<ScannerComponent onRead={onRead}>
			<SafeAreaInsets type="top" />
			<NavigationHeader
				style={styles.navigationHeader}
				title="Scan Any QR Code"
			/>
		</ScannerComponent>
	);
};

const styles = StyleSheet.create({
	navigationHeader: {
		zIndex: 100,
	},
});

export default memo(ScannerScreen);
