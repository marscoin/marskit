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
import DetectSwipe from '../../components/DetectSwipe';
import BalanceHeader from '../../components/BalanceHeader';
import TodoCarousel from '../../components/TodoCarousel';

const Wallets = ({ navigation }): ReactElement => {
	LayoutAnimation.easeInEaseOut();

	const onSwipeLeft = (): void => {
		//Swiping left, navigate to the scanner/camera.
		navigation.navigate('Scanner');
	};

	return (
		<DetectSwipe onSwipeLeft={onSwipeLeft}>
			<View style={styles.container}>
				<View>
					<Header />
					<ScrollView showsVerticalScrollIndicator={false}>
						<BalanceHeader />
						<TodoCarousel />
						<View style={styles.content}>
							<BitcoinCard />
							<LightningCard />
							<OmniboltCard />
						</View>
					</ScrollView>
				</View>
				<ActivitySwipeUpPanel />
			</View>
		</DetectSwipe>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	content: {
		paddingHorizontal: 20,
	},
});

export default memo(Wallets);
