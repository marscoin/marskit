/**
 * @format
 * @flow strict-local
 */

import React, { memo } from 'react';
import { LayoutAnimation, StyleSheet } from 'react-native';
import { View } from '../../styles/components';
import Header from './Header';
import BitcoinCard from './BitcoinCard';
import LightningCard from './lighting/LightningCard';

const Wallets = () => {
	LayoutAnimation.easeInEaseOut();

	//TODO this will probably fetch all available wallets and list them

	return (
		<View style={styles.container}>
			<Header />

			<BitcoinCard />
			<LightningCard />
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
