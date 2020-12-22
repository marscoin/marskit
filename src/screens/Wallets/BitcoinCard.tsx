/**
 * @format
 * @flow strict-local
 */

import React, { memo, ReactElement, useState } from 'react';
import { LayoutAnimation, StyleSheet } from 'react-native';
import { View } from '../../styles/components';
import Receive from './Receive';
import Button from '../../components/Button';
import AssetCard from '../../components/AssetCard';
import { useNavigation } from '@react-navigation/native';

const BitcoinCard = (): ReactElement => {
	const [displayReceive, setDisplayReceive] = useState(false);
	const navigation = useNavigation();

	LayoutAnimation.easeInEaseOut();

	return (
		<AssetCard
			title="Bitcoin Wallet"
			assetBalanceLabel="0 BTC"
			fiatBalanceLabel="$0"
			asset="bitcoin">
			<>
				<View color="transparent" style={styles.buttonRow}>
					<Button color="onSurface" style={styles.sendButton} text="Send" />
					<Button
						color="onSurface"
						style={styles.receiveButton}
						onPress={(): void => setDisplayReceive(!displayReceive)}
						onLongPress={(): void =>
							navigation.navigate('ReceiveAsset', {
								id: 'bitcoin',
							})
						}
						text="Receive"
					/>
				</View>
				{displayReceive && <Receive header={false} />}
			</>
		</AssetCard>
	);
};

const styles = StyleSheet.create({
	buttonRow: {
		flexDirection: 'row',
		marginTop: 10,
	},
	sendButton: {
		flex: 1,
		marginRight: 5,
	},
	receiveButton: {
		flex: 1,
		marginLeft: 5,
	},
});

export default memo(BitcoinCard);
