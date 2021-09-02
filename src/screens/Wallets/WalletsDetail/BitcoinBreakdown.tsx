/**
 * @format
 * @flow strict-local
 */

import React, { memo, ReactElement } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import {
	Caption13M,
	Text01M,
	View,
	TransferIcon,
} from '../../../styles/components';
import { useBalance } from '../SendOnChainTransaction/WalletHook';

const BitcoinBreakdown = (): ReactElement => {
	const onchainBalance = useBalance({ onchain: true });
	const lightningBalance = useBalance({ lightning: true });

	return (
		<View color={'transparent'} style={styles.container}>
			<View color={'transparent'} style={styles.col1}>
				<Text01M>Onchain</Text01M>
				<Caption13M>
					{onchainBalance.bitcoinSymbol}
					{onchainBalance.bitcoinFormatted}
				</Caption13M>
				<Caption13M color={'gray'}>
					≈{onchainBalance.fiatSymbol}
					{onchainBalance.fiatFormatted}
				</Caption13M>
			</View>
			<View color={'transparent'} style={styles.col2}>
				<TouchableOpacity>
					<View style={styles.transferButton} color={'surface'}>
						<TransferIcon color={'white'} />
					</View>
				</TouchableOpacity>
			</View>
			<View color={'transparent'} style={styles.col3}>
				<Text01M>Lightning</Text01M>
				<Caption13M>
					{lightningBalance.bitcoinSymbol}
					{lightningBalance.bitcoinFormatted}
				</Caption13M>
				<Caption13M color={'gray'}>
					≈{lightningBalance.fiatSymbol}
					{lightningBalance.fiatFormatted}
				</Caption13M>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		height: 80,
		display: 'flex',
		flexDirection: 'row',
	},
	col1: {
		flex: 4,
	},
	col2: {
		flex: 3,
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
	},
	col3: {
		flex: 4,
	},
	transferButton: {
		width: 34,
		height: 34,
		borderRadius: 34,
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
	},
});

export default memo(BitcoinBreakdown);
