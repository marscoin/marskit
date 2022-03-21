import React, { memo, ReactElement, useMemo } from 'react';
import { View } from '../../../styles/components';
import { StyleSheet } from 'react-native';
import { capitalize } from '../../../utils/helpers';
import { getReceiveAddress } from '../../../utils/wallet';
import { useSelector } from 'react-redux';
import Store from '../../../store/types';
import QR from '../../../components/QR';
import NavigationHeader from '../../../components/NavigationHeader';

const Receive = ({ asset }: { asset?: string }): ReactElement => {
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
		<View color={'onSurface'} style={styles.container}>
			<NavigationHeader view={'receive'} title={header} />
			<View color={'onSurface'} style={styles.content}>
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
});

export default memo(Receive);
