import React, { memo, ReactElement, useState } from 'react';
import { LayoutAnimation, StyleSheet } from 'react-native';
import { View } from '../../styles/components';
import QR from '../../components/QR';
import Button from '../../components/Button';
import AssetCard from '../../components/AssetCard';
import { useNavigation } from '@react-navigation/native';
import { getConnectPeerInfo } from '../../utils/omnibolt';
import { useSelector } from 'react-redux';
import Store from '../../store/types';

const OmniboltCard = (): ReactElement => {
	const [displayReceive, setDisplayReceive] = useState(false);
	const [displayButtonRow, setDisplayButtonRow] = useState(false);

	const selectedWallet = useSelector(
		(state: Store) => state.wallet.selectedWallet,
	);

	const navigation = useNavigation();

	LayoutAnimation.easeInEaseOut();

	const connectId = getConnectPeerInfo({ selectedWallet });

	const toggleReceiveTransaction = async (): Promise<void> => {
		setDisplayReceive(!displayReceive);
	};

	const shouldDisplayButtons = (): boolean => {
		try {
			return displayButtonRow;
		} catch {
			return false;
		}
	};

	const toggleCard = (): void => {
		if (displayReceive) {
			toggleReceiveTransaction().then();
			return;
		}
		setDisplayButtonRow(!displayButtonRow);
	};

	return (
		<AssetCard
			title="Omnibolt"
			assetBalanceLabel={'Channels: 0'}
			fiatBalanceLabel={'Peers: 0'}
			asset="omnibolt"
			onPress={toggleCard}>
			{shouldDisplayButtons() && (
				<>
					<View color="transparent" style={styles.buttonRow}>
						<Button
							color="onSurface"
							style={styles.receiveButton}
							onPress={toggleReceiveTransaction}
							onLongPress={(): void =>
								navigation.navigate('QR', {
									data: connectId,
									headerTitle: 'Connect',
								})
							}
							text={'Connect'}
						/>
					</View>
					{displayReceive && (
						<QR data={connectId} displayText={false} header={false} />
					)}
				</>
			)}
		</AssetCard>
	);
};

const styles = StyleSheet.create({
	buttonRow: {
		flexDirection: 'row',
		marginTop: 10,
	},
	receiveButton: {
		flex: 1,
		marginLeft: 5,
	},
});

export default memo(OmniboltCard);
