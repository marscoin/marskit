import React, {
	memo,
	PropsWithChildren,
	ReactElement,
	useCallback,
	useEffect,
	useState,
} from 'react';
import {
	LayoutAnimation,
	NativeScrollEvent,
	NativeSyntheticEvent,
	StyleSheet,
} from 'react-native';
import { useSelector } from 'react-redux';
import RadialGradient from 'react-native-radial-gradient';
import Animated, { EasingNode } from 'react-native-reanimated';
import {
	Title,
	Caption13M,
	Headline,
	View,
	ReceiveIcon,
	SendIcon,
	AnimatedView,
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
import { TAssetType } from '../../../store/types/wallet';
import { toggleView } from '../../../store/actions/user';

const updateOpacity = ({
	opacity = new Animated.Value(0),
	toValue = 0,
	duration = 250,
}): void => {
	try {
		Animated.timing(opacity, {
			toValue,
			duration,
			easing: EasingNode.inOut(EasingNode.ease),
		}).start();
	} catch {}
};

const updateHeight = ({
	height = new Animated.Value(0),
	toValue = 0,
	duration = 250,
}): void => {
	try {
		Animated.timing(height, {
			toValue,
			duration,
			easing: EasingNode.inOut(EasingNode.ease),
		}).start();
	} catch {}
};

interface Props extends PropsWithChildren<any> {
	route: {
		params: {
			assetType: TAssetType;
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

	const onSendPress = useCallback(() => {
		toggleView({
			view: 'send',
			data: {
				id: 'bitcoin',
				isOpen: true,
				snapPoint: 0,
				assetName: 'bitcoin',
			},
		}).then();
	}, []);

	const onReceivePress = useCallback(() => {
		toggleView({
			view: 'receive',
			data: {
				isOpen: true,
				snapPoint: 1,
				assetName: 'bitcoin',
			},
		}).then();
	}, []);

	const [showDetails, setShowDetails] = useState(true);
	const [opacity] = useState(new Animated.Value(0));
	const [height] = useState(new Animated.Value(0));

	useEffect(() => {
		updateOpacity({ opacity, toValue: 1 });
		updateHeight({ height, toValue: 230 });
		return (): void => updateOpacity({ opacity, toValue: 0, duration: 0 });
	}, [opacity]);

	// const onScroll = useDebounce<NativeSyntheticEvent<NativeScrollEvent>>((e) => {
	// 	console.log('Hey!');
	// 	console.log(JSON.stringify(e));
	// }, 100);
	//
	// // const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
	// // 	// const { y } = e.nativeEvent.contentOffset;
	// // 	// console.log(Object.keys(e));
	// // 	// console.log(e.nativeEvent);
	// //
	// // 	d().then();
	// // };

	const onScroll = useCallback(
		(e: NativeSyntheticEvent<NativeScrollEvent>) => {
			const { y } = e.nativeEvent.contentOffset;
			if (y > 200 && showDetails) {
				//Shrink the detail view
				LayoutAnimation.easeInEaseOut(() => console.log('closed'));

				// LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

				updateOpacity({ opacity, toValue: 0 });

				updateHeight({ height, toValue: 30, duration: 500 });

				setTimeout(() => {
					setShowDetails(false);
				}, 250);
			}

			if (y < 150 && !showDetails) {
				//They scrolled up so show more details now

				LayoutAnimation.easeInEaseOut(() =>
					updateOpacity({ opacity, toValue: 1 }),
				);

				updateHeight({ height, toValue: 230 });

				setShowDetails(true);

				setTimeout(() => {
					// updateOpacity({ opacity, toValue: 1 });
				}, 500);
			}
			// console.log(e.nativeEvent.contentOffset.y);
		},
		[showDetails],
	);

	console.log(showDetails);

	return (
		<AnimatedView style={styles.container}>
			<View style={styles.radiusContainer}>
				<RadialGradient
					style={styles.assetDetailContainer}
					colors={['rgb(52,34,10)', colors.gray6]}
					stops={[0.1, 0.4]}
					center={[10, 50]}
					radius={gradientRadius}>
					<SafeAreaInsets type={'top'} />

					<NavigationHeader />

					<AnimatedView
						color={'transparent'}
						style={[styles.header, { minHeight: height }]}>
						<Title>{title}</Title>

						{showDetails ? (
							<AnimatedView color={'transparent'} style={{ opacity }}>
								<View color={'transparent'} style={styles.balanceContainer}>
									<View
										color={'transparent'}
										style={styles.largeValueContainer}>
										<Headline color={'gray'}>{fiatSymbol}</Headline>
										<Headline>{fiatWhole}</Headline>
										<Headline color={'gray'}>
											{fiatDecimal}
											{fiatDecimalValue}
										</Headline>
									</View>

									<Caption13M color={'gray'}>
										{bitcoinSymbol}
										{bitcoinFormatted}
									</Caption13M>
								</View>
								{assetType === 'bitcoin' ? <BitcoinBreakdown /> : null}
							</AnimatedView>
						) : null}
					</AnimatedView>
				</RadialGradient>
			</View>
			{/*<View color={'gray6'} style={styles.radiusFooter} />*/}

			<View color={'transparent'} style={styles.txListContainer}>
				<ActivityList
					assetFilter={assetFilter}
					onScroll={onScroll}
					style={styles.txList}
					contentContainerStyle={styles.scrollContent}
					progressViewOffset={350}
				/>
			</View>
			<View color={'transparent'} style={styles.buttons}>
				<Button
					color={'surface'}
					style={styles.button}
					icon={<SendIcon color={'gray1'} />}
					text={'Send'}
					//@ts-ignore
					onPress={onSendPress}
				/>
				<Button
					color={'surface'}
					style={styles.button}
					icon={<ReceiveIcon color={'gray1'} />}
					text={'Receive'}
					//@ts-ignore
					onPress={onReceivePress}
				/>
			</View>
			<SafeAreaInsets type={'bottom'} maxPaddingBottom={20} />
		</AnimatedView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	assetDetailContainer: { paddingBottom: 20 },
	radiusContainer: {
		overflow: 'hidden',
		borderBottomRightRadius: 16,
		borderBottomLeftRadius: 16,
		zIndex: 99,
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
	txListContainer: {
		flex: 1,

		position: 'absolute',
		width: '100%',
		height: '100%',
	},
	txList: {
		paddingHorizontal: 20,
	},
	scrollContent: {
		paddingTop: 350,
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
