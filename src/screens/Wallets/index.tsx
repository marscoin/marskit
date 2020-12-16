/**
 * @format
 * @flow strict-local
 */

import React, { memo } from 'react';
import { LayoutAnimation, StyleSheet } from 'react-native';
import { View, TouchableOpacity } from '../../styles/components';
import Header from './Header';
import Store from '../../store/types';
import { useSelector } from 'react-redux';
import { lightningStatusMessage } from '../../utils/lightning-debug';
import WalletListItem from './WalletListItem';
import BitcoinCard from './BitcoinCard';

const Wallets = ({ navigation }) => {
	const lightning = useSelector((state: Store) => state.lightning);

	LayoutAnimation.easeInEaseOut();

	//TODO this will probably fetch all available wallets and list them

	return (
		<View style={styles.container}>
			<Header />

			<TouchableOpacity onPress={() => navigation.navigate('WalletsDetail')}>
				<WalletListItem
					title={'Bitcoin'}
					network={`Lightning network (${lightningStatusMessage(lightning)})`}
					balance={0}
					fiatBalance={0}
				/>
			</TouchableOpacity>

			<BitcoinCard />
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		paddingRight: 20,
		paddingLeft: 20,
	},
});

export default memo(Wallets);
