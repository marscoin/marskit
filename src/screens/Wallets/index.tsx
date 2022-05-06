/**
 * @format
 * @flow strict-local
 */

import React, { memo, ReactElement } from 'react';
import { LayoutAnimation, StyleSheet } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { View, Subtitle, BitcoinCircleIcon } from '../../styles/components';
import Header from './Header';
import DetectSwipe from '../../components/DetectSwipe';
import BalanceHeader from '../../components/BalanceHeader';
import TodoCarousel from '../../components/TodoCarousel';
import BoostCards from './BoostCards';
import SafeAreaView from '../../components/SafeAreaView';
import AssetCard from '../../components/AssetCard';
import ActivityListShort from '../../screens/Activity/ActivityListShort';
import { useBalance } from '../../hooks/wallet';

const Wallets = ({ navigation }): ReactElement => {
	LayoutAnimation.easeInEaseOut();

	const onSwipeLeft = (): void => {
		//Swiping left, navigate to the scanner/camera.
		navigation.navigate('Scanner');
	};

	const bitcoinBalances = useBalance({ onchain: true, lightning: true });

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
						<Subtitle style={styles.assetsTitle}>Assets</Subtitle>
						<AssetCard
							name={'Bitcoin'}
							ticker={'BTC'}
							balances={bitcoinBalances}
							icon={<BitcoinCircleIcon />}
							onPress={(): void =>
								navigation.navigate('WalletsDetail', { assetType: 'bitcoin' })
							}
						/>
					</View>
				</DetectSwipe>
				<View style={styles.content}>
					<ActivityListShort />
				</View>
			</ScrollView>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	content: {
		paddingHorizontal: 16,
	},
	scrollview: {
		paddingBottom: 400,
	},
	assetsTitle: {
		marginBottom: 8,
		marginTop: 10,
	},
});

export default memo(Wallets);
