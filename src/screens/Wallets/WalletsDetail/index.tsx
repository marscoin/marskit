import React, { memo, PropsWithChildren, ReactElement, useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import RadialGradient from 'react-native-radial-gradient';
import { Title, Caption13M, Headline, View } from '../../../styles/components';
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

	const {
		bitcoinFormatted,
		bitcoinSymbol,
		fiatWhole,
		fiatDecimal,
		fiatDecimalValue,
		fiatSymbol,
	} = useBalance({ onchain: true, lightning: true });

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
					<Title>Bitcoin</Title>
					<View color={'transparent'} style={styles.balanceContainer}>
						<Caption13M color={'gray'}>
							{bitcoinSymbol}
							{bitcoinFormatted}
						</Caption13M>

						<View color={'transparent'} style={styles.largeValueContainer}>
							<Headline color={'gray'}>{fiatSymbol}</Headline>
							<Headline>{fiatWhole}</Headline>
							<Headline color={'gray'}>
								{fiatDecimal}
								{fiatDecimalValue}
							</Headline>
						</View>
					</View>
					{assetType === 'bitcoin' ? <BitcoinBreakdown /> : null}
					{/*<View color={'transparent'} style={styles.txButtonsContainer}>*/}
					{/*	<Button color={'surface'} style={styles.txButton} text={'Send'} />*/}
					{/*	<Button color={'surface'} text={'Receive'} />*/}
					{/*</View>*/}
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
		marginVertical: 18,
	},
	txButton: {
		marginRight: 16,
	},
	txButtonsContainer: {
		display: 'flex',
		flexDirection: 'row',
		marginVertical: 20,
	},
	largeValueContainer: {
		display: 'flex',
		flexDirection: 'row',
	},
});

export default memo(WalletsDetail);
