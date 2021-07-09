/**
 * @format
 * @flow strict-local
 */

import React, { memo, ReactElement } from 'react';
import { LayoutAnimation, ScrollView, StyleSheet } from 'react-native';
import { View } from '../../styles/components';
import Header from './Header';
import BitcoinCard from './BitcoinCard';
import LightningCard from './LightningCard';
import OmniboltCard from './OmniboltCard';
import ActivitySwipeUpPanel from '../Activity/ActivitySwipeUpPanel';

const Wallets = (): ReactElement => {
	LayoutAnimation.easeInEaseOut();
	return (
		<>
			<View style={styles.container}>
				<Header />
				<ScrollView showsVerticalScrollIndicator={false}>
					<BitcoinCard />
					<LightningCard />
					<OmniboltCard />
				</ScrollView>
			</View>
			<ActivitySwipeUpPanel />
		</>
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
