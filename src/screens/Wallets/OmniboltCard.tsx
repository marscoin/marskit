import React, { memo, ReactElement, useCallback, useState } from 'react';
import { LayoutAnimation, StyleSheet } from 'react-native';
import { View } from '../../styles/components';
import QR from '../../components/QR';
import Button from '../../components/Button';
import AssetCard from '../../components/AssetCard';
import { useNavigation } from '@react-navigation/native';
import { getConnectPeerInfo } from '../../utils/omnibolt';
import { useSelector } from 'react-redux';
import Store from '../../store/types';
import SendOmniAsset from './SendOmniAsset';

const OmniboltCard = (): ReactElement => {
	const [displayReceive, setDisplayReceive] = useState(false);
	const [displayButtonRow, setDisplayButtonRow] = useState(false);

	const selectedWallet = useSelector(
		(state: Store) => state.wallet.selectedWallet,
	);

	const selectedNetwork = useSelector(
		(state: Store) => state.wallet.selectedNetwork,
	);

	const channels = useSelector(
		(state: Store) =>
			state.omnibolt.wallets[selectedWallet].channels[selectedNetwork],
	);

	const tempChannels = useSelector(
		(state: Store) =>
			state.omnibolt.wallets[selectedWallet].tempChannels[selectedNetwork],
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

	const channelCount = useCallback((): number => {
		try {
			return Object.keys(channels)?.length || 0;
		} catch (e) {
			return 0;
		}
	}, [channels]);
	const tempChannelCount = useCallback((): number => {
		try {
			return Object.keys(tempChannels)?.length || 0;
		} catch (e) {
			return 0;
		}
	}, [tempChannels]);

	return (
		<AssetCard
			title="Omnibolt"
			assetBalanceLabel={`Channels: ${channelCount()}\nTemp Channels ${tempChannelCount()}`}
			fiatBalanceLabel={''}
			asset="omnibolt"
			onPress={toggleCard}>
			{shouldDisplayButtons() && (
				<>
					{Object.keys(channels).map((channelId, i) => (
						<View
							key={`${channelId}${i}`}
							color={'transparent'}
							style={styles.sendAssetContainer}>
							<SendOmniAsset channelId={channelId} />
						</View>
					))}
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
	sendAssetContainer: {
		marginVertical: 20,
	},
});

export default memo(OmniboltCard);
