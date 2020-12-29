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
import { useSelector } from 'react-redux';
import Store from '../../store/types';
import { getFiatBalance, getNetworkData } from '../../utils/helpers';
import { default as bitcoinUnits } from 'bitcoin-units';

const BitcoinCard = (): ReactElement => {
	const [displayReceive, setDisplayReceive] = useState(false);

	const navigation = useNavigation();

	const selectedNetwork = useSelector(
		(state: Store) => state.wallet.selectedNetwork,
	);
	const selectedWallet = useSelector(
		(state: Store) => state.wallet.selectedWallet,
	);
	const exchangeRate = useSelector((state: Store) => state.wallet.exchangeRate);
	const bitcoinUnit = useSelector((state: Store) => state.settings.bitcoinUnit);
	const selectedCurrency = useSelector(
		(state: Store) => state.settings.selectedCurrency,
	);

	const networkData = getNetworkData({ bitcoinUnit, selectedNetwork });
	let balance = useSelector((state: Store) => {
		try {
			return state.wallet.wallets[selectedWallet].balance[selectedNetwork];
		} catch {
			return 0;
		}
	});
	const fiatBalance = getFiatBalance({
		balance,
		exchangeRate,
		selectedCurrency,
	});
	balance = bitcoinUnits(balance, 'satoshi').to(bitcoinUnit).value();

	LayoutAnimation.easeInEaseOut();

	return (
		<AssetCard
			title="Bitcoin Wallet"
			assetBalanceLabel={`${balance} ${networkData.abbreviation}`}
			fiatBalanceLabel={`$${fiatBalance}`}
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
