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
import { PanGestureHandler } from 'react-native-gesture-handler';

const Wallets = ({ navigation }): ReactElement => {
	LayoutAnimation.easeInEaseOut();

	const onPanGestureEvent = (event): void => {
		if (event.nativeEvent.velocityX < -600) {
			//Swiping left, navigate to the scanner/camera.
			navigation.navigate('Scanner');
		}
		/*if (event.nativeEvent.velocityX > 600) {
			//Swiping right.
		}*/
	};

	return (
		<PanGestureHandler onGestureEvent={onPanGestureEvent}>
			<View style={styles.container}>
				<View>
					<Header />
					<ScrollView showsVerticalScrollIndicator={false}>
						<BitcoinCard />
						<LightningCard />
						<OmniboltCard />
					</ScrollView>
				</View>
				<ActivitySwipeUpPanel />
			</View>
		</PanGestureHandler>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
});

export default memo(Wallets);
