/**
 * @format
 * @flow strict-local
 */

import React, { memo, ReactElement } from 'react';
import { LayoutAnimation, StyleSheet } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import {
	View,
	Subtitle,
	BitcoinCircleIcon,
	TetherCircleIcon,
} from '../../styles/components';
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
import AssetCard from '../../components/AssetCard';
import { useBalance } from '../../hooks/wallet';

const Wallets = ({ navigation }): ReactElement => {
	LayoutAnimation.easeInEaseOut();

	const onSwipeLeft = (): void => {
		//Swiping left, navigate to the scanner/camera.
		navigation.navigate('Scanner');
	};

	const bitcoinBalances = useBalance({ onchain: true, lightning: true });
	const tetherBalances = useBalance({ omnibolt: true });

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

						<AssetCard
							name={'Tether'}
							ticker={'USDT'}
							icon={<TetherCircleIcon />}
							balances={tetherBalances}
							onPress={(): void =>
								navigation.navigate('WalletsDetail', { assetType: 'tether' })
							}
						/>

						{/*TODO remove the below cards when not needed anymore*/}
						<Subtitle style={styles.assetsTitle}>OLD Assets</Subtitle>
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
	assetsTitle: {
		marginBottom: 8,
		marginTop: 10,
	},
});

export default memo(Wallets);
