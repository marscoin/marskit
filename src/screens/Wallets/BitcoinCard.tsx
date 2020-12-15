/**
 * @format
 * @flow strict-local
 */

import React, { memo, useState } from 'react';
import { LayoutAnimation, StyleSheet } from 'react-native';
import { View } from '../../styles/components';
import Receive from './Receive';
import Button from '../../components/Button';
import AssetCard from '../../components/AssetCard';

const BitcoinCard = () => {
	const [displayReceive, setDisplayReceive] = useState(false);
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
						onPress={() => setDisplayReceive(!displayReceive)}
						text="Receive"
					/>
				</View>
				{displayReceive && <Receive />}
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
