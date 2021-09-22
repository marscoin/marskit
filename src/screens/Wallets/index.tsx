/**
 * @format
 * @flow strict-local
 */

import React, { memo, ReactElement } from 'react';
import { LayoutAnimation, StyleSheet } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { View } from '../../styles/components';
import Header from './Header';
import BitcoinCard from './BitcoinCard';
import LightningCard from './LightningCard';
import OmniboltCard from './OmniboltCard';
import DetectSwipe from '../../components/DetectSwipe';
import BalanceHeader from '../../components/BalanceHeader';
import TodoCarousel from '../../components/TodoCarousel';
import BoostCards from './BoostCards';
import ActivityList from '../Activity/ActivityList';
import SafeAreaView from '../../components/SafeAreaView';

const Wallets = ({ navigation }): ReactElement => {
	LayoutAnimation.easeInEaseOut();

	const onSwipeLeft = (): void => {
		//Swiping left, navigate to the scanner/camera.
		navigation.navigate('Scanner');
	};

	return (
		<SafeAreaView>
			<Header />
			<ScrollView
				contentContainerStyle={styles.scrollview}
				disableScrollViewPanResponder={true}
				showsVerticalScrollIndicator={false}>
				<DetectSwipe onSwipeLeft={onSwipeLeft}>
					<View>
						<BalanceHeader />
					</View>
				</DetectSwipe>
				<View style={styles.content}>
					<BoostCards />
				</View>
				<TodoCarousel />
				<DetectSwipe onSwipeLeft={onSwipeLeft}>
					<View style={styles.content}>
						<BitcoinCard />
						<LightningCard />
						<OmniboltCard />
						<ActivityList />
					</View>
				</DetectSwipe>
			</ScrollView>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	content: {
		paddingHorizontal: 20,
	},
	scrollview: {
		paddingBottom: 400,
	},
});

export default memo(Wallets);
