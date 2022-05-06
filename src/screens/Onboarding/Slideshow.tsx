import React, { ReactElement, useState, useRef, useMemo } from 'react';
import {
	Alert,
	Image,
	StyleSheet,
	TouchableOpacity,
	useWindowDimensions,
} from 'react-native';
import Swiper from 'react-native-swiper';
import { FadeIn, FadeOut } from 'react-native-reanimated';
import {
	AnimatedView,
	DisplayHaas,
	Text01M,
	Text01S,
	View,
} from '../../styles/components';
import SafeAreaInsets from '../../components/SafeAreaInsets';
import GlowingBackground from '../../components/GlowingBackground';
import Button from '../../components/Button';
import { createNewWallet } from '../../utils/startup';
import { showErrorNotification } from '../../utils/notifications';
import { sleep } from '../../utils/helpers';
import useColors from '../../hooks/colors';
import LoadingWalletScreen from './Loading';

const Dot = ({ active }: { active?: boolean }): ReactElement => {
	return <View color={active ? 'white' : 'gray2'} style={styles.pageDot} />;
};

/**
 * Slideshow for Welcome screen
 */
const Slideshow = ({
	navigation,
	route,
}: {
	navigation: any;
	route: { params: { skipIntro?: boolean } };
}): ReactElement => {
	const skipIntro = route?.params?.skipIntro;
	const swiperRef = useRef(null);
	const [isCreatingWallet, setIsCreatingWallet] = useState(false);
	const colors = useColors();
	// because we can't properly scala image inside the <Swiper let's calculate with by hand
	const dimensions = useWindowDimensions();
	const illustrationStyles = useMemo(
		() => ({
			...styles.illustration,
			width: dimensions.width * 0.75,
			height: dimensions.width * 0.8,
		}),
		[dimensions.width],
	);

	const onNewWallet = async (): Promise<void> => {
		setIsCreatingWallet(true);
		await sleep(500); // wait fot animation to be started
		const res = await createNewWallet();
		if (res.isErr()) {
			setIsCreatingWallet(false);
			showErrorNotification({
				title: 'Wallet creation failed',
				message: res.error.message,
			});
		}
	};

	const onRestore = (): void => {
		Alert.alert('Restore', '', [
			{
				text: 'From backup server',
				onPress: (): void => navigation.navigate('RestoreAccount'),
			},
			{
				text: 'From file',
				onPress: (): void => navigation.navigate('RestoreAccountFromFile'),
			},
			{
				text: 'From seed',
				onPress: (): void => navigation.navigate('RestoreFromSeed'),
			},
			{
				text: 'Cancel',
				onPress: (): void => {},
				style: 'cancel',
			},
		]);
	};

	const slides = useMemo(
		() => [
			{
				topLeftColor: colors.brand,
				slide: (): ReactElement => (
					<View color={'transparent'} style={styles.slide}>
						<View color={'transparent'} style={styles.imageContainer}>
							<Image
								style={styles.floatIllustraion}
								source={require('../../assets/illustrations/figures.png')}
							/>
						</View>
						<View color={'transparent'} style={styles.textContent}>
							<DisplayHaas lineHeight="48px">
								Welcome to the
								<DisplayHaas lineHeight="48px" color="brand">
									{' '}
									Atomic Economy.
								</DisplayHaas>
							</DisplayHaas>
							<Text01S color="gray1" style={styles.text}>
								Bitkit is your toolkit for a new economy, where everything is
								based on Bitcoin.
							</Text01S>
						</View>
						<SafeAreaInsets type={'bottom'} />
					</View>
				),
			},

			{
				topLeftColor: colors.orange,
				slide: (): ReactElement => (
					<View color={'transparent'} style={styles.slide}>
						<View color={'transparent'} style={styles.imageContainer}>
							<Image
								style={illustrationStyles}
								source={require('../../assets/illustrations/shield-b.png')}
							/>
						</View>
						<View color={'transparent'} style={styles.textContent}>
							<DisplayHaas lineHeight="48px">
								Money,
								<DisplayHaas lineHeight="48px" color="orange">
									{' '}
									Owned by You.
								</DisplayHaas>
							</DisplayHaas>
							<Text01S color="gray1" style={styles.text}>
								Be in charge of your own money. Spend your Bitcoin on the things
								that you value in life.
							</Text01S>
						</View>
						<SafeAreaInsets type={'bottom'} />
					</View>
				),
			},

			{
				topLeftColor: '#B95CE8',
				slide: (): ReactElement => (
					<View color={'transparent'} style={styles.slide}>
						<View color={'transparent'} style={styles.imageContainer}>
							<Image
								style={illustrationStyles}
								source={require('../../assets/illustrations/lightning.png')}
							/>
						</View>
						<View color={'transparent'} style={styles.textContent}>
							<DisplayHaas lineHeight="48px">
								Bitcoin,
								<DisplayHaas lineHeight="48px" style={styles.headline2}>
									{' '}
									Lightning fast.
								</DisplayHaas>
							</DisplayHaas>
							<Text01S color="gray1" style={styles.text}>
								Send Bitcoin faster than ever. Set up an instant connection and
								pay anyone, anywhere.
							</Text01S>
						</View>
						<SafeAreaInsets type={'bottom'} />
					</View>
				),
			},

			{
				topLeftColor: colors.green,
				slide: (): ReactElement => (
					<View color={'transparent'} style={styles.slide}>
						<View color={'transparent'} style={styles.imageContainer}>
							<Image
								style={illustrationStyles}
								source={require('../../assets/illustrations/coins.png')}
							/>
						</View>
						<View color={'transparent'} style={styles.textContent}>
							<DisplayHaas lineHeight="48px">
								Instant{' '}
								<DisplayHaas lineHeight="48px" style={styles.headline3}>
									Tether.
								</DisplayHaas>
							</DisplayHaas>
							<Text01S color="gray1" style={styles.text}>
								Save and spend traditional currency, gifts, rewards, and digital
								assets instantly and borderless.
							</Text01S>
						</View>
						<SafeAreaInsets type={'bottom'} />
					</View>
				),
			},

			{
				topLeftColor: colors.blue,
				slide: (): ReactElement => (
					<View color={'transparent'} style={styles.slide}>
						<View color={'transparent'} style={styles.imageContainer}>
							<Image
								style={illustrationStyles}
								source={require('../../assets/illustrations/padlock.png')}
							/>
						</View>
						<View color={'transparent'} style={styles.textContent}>
							<DisplayHaas lineHeight="48px">
								Log in with
								<DisplayHaas lineHeight="48px" color="blue">
									{' '}
									just a Tap.
								</DisplayHaas>
							</DisplayHaas>
							<Text01S color="gray1" style={styles.text}>
								Experience the web without passwords. Use Slashtags to take
								control of your accounts & contacts.
							</Text01S>
						</View>
						<SafeAreaInsets type={'bottom'} />
					</View>
				),
			},

			{
				topLeftColor: colors.yellow,
				slide: (): ReactElement => (
					<View color={'transparent'} style={styles.slide}>
						<View color={'transparent'} style={styles.imageContainer}>
							<Image
								style={illustrationStyles}
								source={require('../../assets/illustrations/gift.png')}
							/>
						</View>
						<View color={'transparent'} style={styles.textContent}>
							<DisplayHaas lineHeight="48px">
								Money gets
								<DisplayHaas lineHeight="48px" color="yellow">
									{' '}
									Personal.
								</DisplayHaas>
							</DisplayHaas>
							<Text01S color="gray1" style={styles.text}>
								Pay, tip or gift your friends & family Bitcoin, Tether and other
								tokens and attach a personal note.
							</Text01S>
						</View>
						<SafeAreaInsets type={'bottom'} />
					</View>
				),
			},

			{
				topLeftColor: colors.brand,
				slide: (): ReactElement => (
					<View color={'transparent'} style={styles.slide}>
						<View color={'transparent'} style={styles.imageContainer}>
							<Image
								style={illustrationStyles}
								source={require('../../assets/illustrations/wallet.png')}
							/>
						</View>
						<View color={'transparent'} style={styles.textContent}>
							<DisplayHaas lineHeight="48px">
								Money needs
								<DisplayHaas lineHeight="48px" color="brand">
									{' '}
									a Wallet.
								</DisplayHaas>
							</DisplayHaas>
							<Text01S color="gray1" style={styles.text}>
								Time to set up your Bitkit Wallet
							</Text01S>

							<View color={'transparent'} style={styles.buttonsContainer}>
								<Button
									size="large"
									style={[styles.button, styles.restoreButton]}
									onPress={onNewWallet}
									text="New wallet"
								/>

								<Button
									size="large"
									variant="secondary"
									style={[styles.button, styles.newButton]}
									onPress={onRestore}
									text="Restore"
								/>
							</View>
						</View>
						<SafeAreaInsets type={'bottom'} />
					</View>
				),
			},
		],
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[],
	);

	const onScroll = (i): void => {
		if (i > slides.length - 1) {
			// react-native-swiper bug. on Andoid
			// If you Skip to last slide and then try to swipe back
			// it calls onScroll with index more that number of slides you have
			i = slides.length - 2;
		}
		setIndex(i);
	};
	const onSkip = (): void => {
		swiperRef.current?.scrollBy(slides.length - 1 - index);
	};

	const [index, setIndex] = useState(skipIntro ? slides.length - 1 : 0);

	if (isCreatingWallet) {
		return (
			<GlowingBackground topLeft={colors.green}>
				<LoadingWalletScreen />
			</GlowingBackground>
		);
	}

	return (
		<GlowingBackground topLeft={slides[index].topLeftColor}>
			<>
				<Swiper
					ref={swiperRef}
					dot={<Dot />}
					activeDot={<Dot active />}
					loop={false}
					index={index}
					onIndexChanged={onScroll}>
					{slides.map(({ slide: Slide }, i) => (
						<Slide key={i} />
					))}
				</Swiper>

				{index !== slides.length - 1 && (
					<AnimatedView
						entering={FadeIn}
						exiting={FadeOut}
						color={'transparent'}
						style={styles.headerButtonContainer}>
						<TouchableOpacity style={styles.skipButton} onPress={onSkip}>
							<SafeAreaInsets type={'top'} />
							<Text01M color={'gray1'}>Skip</Text01M>
						</TouchableOpacity>
					</AnimatedView>
				)}
			</>
		</GlowingBackground>
	);
};

const styles = StyleSheet.create({
	headerButtonContainer: {
		flexDirection: 'row',
		width: '100%',
		justifyContent: 'flex-end',
		top: 20,
		paddingHorizontal: 28,
		position: 'absolute',
	},
	skipButton: {
		backgroundColor: 'transparent',
	},
	buttonsContainer: {
		flexDirection: 'row',
		marginTop: 70,
	},
	button: {
		flex: 1,
	},
	restoreButton: {
		marginRight: 6,
	},
	newButton: {
		marginLeft: 6,
	},

	slide: {
		flex: 1,
		justifyContent: 'space-between',
		alignItems: 'stretch',
	},
	imageContainer: {
		flex: 4,
		alignItems: 'center',
		paddingVertical: 25,
		justifyContent: 'flex-end',
		position: 'relative', // for first slide background image
	},
	floatIllustraion: {
		position: 'absolute',
		top: 10,
	},
	illustration: {
		resizeMode: 'contain',
	},
	textContent: {
		flex: 3,
		paddingHorizontal: 48,
	},
	pageDot: {
		width: 7,
		height: 7,
		borderRadius: 4,
		marginLeft: 4,
		marginRight: 4,
		marginBottom: 30, // lift dot's up
	},
	headline2: {
		color: 'rgba(172, 101, 225, 1)',
		lineHeight: 48,
	},
	headline3: {
		color: 'rgba(134, 188, 122, 1)',
	},
	text: {
		marginTop: 8,
	},
});

export default Slideshow;
