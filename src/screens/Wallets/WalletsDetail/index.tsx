import React, { memo, PropsWithChildren, ReactElement } from 'react';
import { StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import RadialGradient from 'react-native-radial-gradient';
import { Headline, Title, Caption13M, View } from '../../../styles/components';
import NavigationHeader from '../../../components/NavigationHeader';
import { useBalance } from '../SendOnChainTransaction/WalletHook';
import Button from '../../../components/Button';
import ActivityList from '../../Activity/ActivityList';
import Store from '../../../store/types';
import themes from '../../../styles/themes';
import BitcoinBreakdown from './BitcoinBreakdown';

interface Props extends PropsWithChildren<any> {
	route: {
		params: {
			assetType: 'bitcoin' | 'tether';
		};
	};
	navigation: any;
}

const WalletsDetail = (props: Props): ReactElement => {
	const { route, navigation } = props;

	const { assetType } = route.params;

	const { bitcoinFormatted, bitcoinTicker, fiatFormatted, fiatSymbol } =
		useBalance({ onchain: true, lightning: true });

	const theme = useSelector((state: Store) => state.settings.theme);
	const { colors } = themes[theme];

	return (
		<View style={styles.container}>
			<RadialGradient
				style={styles.content}
				colors={['rgb(52,34,10)', colors.tabBackground]}
				stops={[0.1, 0.4]}
				center={[50, 50]}
				radius={600}>
				<NavigationHeader />

				<View color={'transparent'} style={styles.header}>
					<Headline size={'26px'}>Bitcoin</Headline>
					<View color={'transparent'} style={styles.balanceContainer}>
						<Title size={'34px'}>
							{fiatSymbol}
							{fiatFormatted}
						</Title>
						<Caption13M size={'14px'} color={'gray'}>
							{bitcoinFormatted} {bitcoinTicker}
						</Caption13M>
					</View>
					{assetType === 'bitcoin' ? <BitcoinBreakdown /> : null}
					<View color={'transparent'} style={styles.txButtonsContainer}>
						<Button color={'surface'} style={styles.txButton} text={'Send'} />
						<Button color={'surface'} text={'Receive'} />
					</View>
				</View>
			</RadialGradient>
			<View color={'tabBackground'} style={styles.radiusFooter} />

			<ActivityList />
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	content: {},
	radiusFooter: {
		height: 20,
		borderBottomRightRadius: 16,
		borderBottomLeftRadius: 16,
	},
	header: {
		paddingHorizontal: 20,
	},
	balanceContainer: {
		marginVertical: 28,
	},
	txButton: {
		marginRight: 16,
	},
	txButtonsContainer: {
		display: 'flex',
		flexDirection: 'row',
		marginVertical: 20,
	},
});

export default memo(WalletsDetail);
