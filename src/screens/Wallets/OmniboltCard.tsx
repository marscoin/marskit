import React, { memo, ReactElement, useCallback, useState } from 'react';
import { LayoutAnimation, StyleSheet } from 'react-native';
import { View } from '../../styles/components';
import QR from '../../components/QR';
import Button from '../../components/Button';
import AssetCard from '../../components/AssetCard_deprecated';
import { getConnectUri } from '../../utils/omnibolt';
import { useSelector } from 'react-redux';
import Store from '../../store/types';
import OmniboltChannelCard from './OmniboltChannelCard';

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

	LayoutAnimation.easeInEaseOut();

	const connectId = getConnectUri();

	const toggleReceiveTransaction = async (): Promise<void> => {
		setDisplayReceive(!displayReceive);
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
			return (
				Object.keys(channels)?.filter((channel) => {
					return channels[channel].curr_state !== 21;
				}).length || 0
			);
		} catch (e) {
			return 0;
		}
	}, [channels]);
	const closedChannelCount = useCallback((): number => {
		try {
			return (
				Object.keys(channels)?.filter((channel) => {
					return channels[channel].curr_state === 21;
				}).length || 0
			);
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
			assetBalanceLabel={`Channels: ${channelCount()}\nTemp: ${tempChannelCount()}\nClosed: ${closedChannelCount()}`}
			fiatBalanceLabel={''}
			asset="omnibolt"
			onPress={toggleCard}>
			{displayButtonRow && (
				<>
					<View color="transparent" style={styles.buttonRow}>
						<Button
							color="onSurface"
							style={styles.button}
							onPress={toggleReceiveTransaction}
							text={'Connect'}
						/>
					</View>
					{displayReceive && (
						<QR data={connectId} displayText={false} header={false} />
					)}
					{Object.keys(channels).map((channelId, i) => (
						<View
							key={`${channelId}${i}`}
							color={'transparent'}
							style={styles.sendAssetContainer}>
							<OmniboltChannelCard channelId={channelId} />
						</View>
					))}
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
	button: {
		flex: 1,
		marginLeft: 5,
	},
	sendAssetContainer: {
		marginVertical: 20,
	},
});

export default memo(OmniboltCard);
