import React, { memo, ReactElement, useMemo } from 'react';
import { View, Text01M } from '../../../styles/components';
import { StyleSheet } from 'react-native';
import { TAssetType } from '../../../store/types/wallet';
import { capitalize } from '../../../utils/helpers';
import { getReceiveAddress } from '../../../utils/wallet';
import { useSelector } from 'react-redux';
import Store from '../../../store/types';
import QR from '../../../components/QR';

const Receive = ({ asset }: { asset?: TAssetType | string }): ReactElement => {
	const header = useMemo(
		(): string => (asset ? `Receive ${capitalize(asset)}` : 'Receive'),
		[asset],
	);
	const selectedWallet = useSelector(
		(state: Store) => state.wallet.selectedWallet,
	);
	const selectedNetwork = useSelector(
		(state: Store) => state.wallet.selectedNetwork,
	);
	const receiveAddress = useMemo((): string => {
		const response = getReceiveAddress({ selectedWallet, selectedNetwork });
		if (response.isOk()) {
			return response.value;
		}
		return ' ';
	}, [selectedNetwork, selectedWallet]);
	return (
		<View style={styles.container}>
			<Text01M style={styles.headerText}>{header}</Text01M>
			<View style={styles.content}>
				<QR data={receiveAddress} header={false} />
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	content: {
		flex: 1,
		marginTop: 20,
	},
	headerText: {
		alignSelf: 'center',
	},
});

export default memo(Receive);
