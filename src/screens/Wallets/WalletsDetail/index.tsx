import React, { memo, PropsWithChildren, ReactElement } from 'react';
import { StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import RadialGradient from 'react-native-radial-gradient';
import {
	Title,
	Caption13M,
	Headline,
	View,
	ReceiveIcon,
	SendIcon,
} from '../../../styles/components';
import NavigationHeader from '../../../components/NavigationHeader';
import { useBalance } from '../../../hooks/wallet';
import ActivityList from '../../Activity/ActivityList';
import Store from '../../../store/types';
import themes from '../../../styles/themes';
import BitcoinBreakdown from './BitcoinBreakdown';
import Button from '../../../components/Button';
import SafeAreaInsets from '../../../components/SafeAreaInsets';
import { EActivityTypes } from '../../../store/types/activity';

interface Props extends PropsWithChildren<any> {
	route: {
		params: {
			assetType: 'bitcoin' | 'tether';
		};
	};
}

const WalletsDetail = (props: Props): ReactElement => {
	const { route } = props;

	const { assetType } = route.params;

	const {
		bitcoinFormatted,
		bitcoinSymbol,
		fiatWhole,
		fiatDecimal,
		fiatDecimalValue,
		fiatSymbol,
	} = useBalance({ onchain: true, lightning: true });

	const colors = useSelector(
		(state: Store) => themes[state.settings.theme].colors,
	);

	let title = '';
	let assetFilter: EActivityTypes[] = [];
	let gradientRadius = 450;
	switch (assetType) {
		case 'bitcoin': {
			title = 'Bitcoin';
			assetFilter = [EActivityTypes.onChain, EActivityTypes.lightning];
			gradientRadius = 600;
			break;
		}
		case 'tether': {
			title = 'Tether';
			assetFilter = [EActivityTypes.tether];
			break;
		}
	}

	return (
		<View style={styles.container}>
			<RadialGradient
				style={styles.content}
				colors={['rgb(52,34,10)', colors.gray6]}
				stops={[0.1, 0.4]}
				center={[50, 50]}
				radius={gradientRadius}>
				<SafeAreaInsets type={'top'} />

				<NavigationHeader />

				<View color={'transparent'} style={styles.header}>
					<Title>{title}</Title>
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
				</View>
			</RadialGradient>
			<View color={'gray6'} style={styles.radiusFooter} />

			<View color={'transparent'} style={styles.transactionsContainer}>
				<View color={'transparent'} style={styles.listContainer}>
					<ActivityList assetFilter={assetFilter} />
				</View>
				<View color={'transparent'} style={styles.buttons}>
					<Button
						color={'surface'}
						style={styles.button}
						icon={<SendIcon color={'gray1'} />}
						text={'Send'}
					/>
					<Button
						color={'surface'}
						style={styles.button}
						icon={<ReceiveIcon color={'gray1'} />}
						text={'Receive'}
					/>
				</View>
			</View>

			<SafeAreaInsets type={'bottom'} maxPaddingBottom={20} />
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
	largeValueContainer: {
		display: 'flex',
		flexDirection: 'row',
	},
	transactionsContainer: {
		flex: 1,
	},
	listContainer: {
		paddingHorizontal: 20,
		flex: 1,
	},
	buttons: {
		position: 'absolute',
		display: 'flex',
		flexDirection: 'row',
		bottom: 0,
		paddingHorizontal: 23,
	},
	button: {
		flex: 1,
		marginHorizontal: 8,
		height: 56,
		borderRadius: 64,
	},
});

export default memo(WalletsDetail);
