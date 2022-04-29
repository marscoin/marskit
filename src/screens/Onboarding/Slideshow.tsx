import React, { ReactElement, useState, useRef, useMemo } from 'react';
import { Alert, Image, StyleSheet, TouchableOpacity } from 'react-native';
import Swiper from 'react-native-swiper';
import { FadeIn, FadeOut } from 'react-native-reanimated';
import {
	AnimatedView,
	DisplayHaas,
	Text01M,
	Text01S,
	Text02M,
	View,
} from '../../styles/components';
import SafeAreaInsets from '../../components/SafeAreaInsets';
import GlowingBackground from '../../components/GlowingBackground';
import { createNewWallet } from '../../utils/startup';
import { showErrorNotification } from '../../utils/notifications';
import { sleep } from '../../utils/helpers';
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
				topLeftColor: '#FF6600',
				slide: (): ReactElement => (
					<View color={'transparent'} style={styles.slide}>
						<View color={'transparent'} style={styles.imageContainer}>
							<Image
								style={styles.image1}
								source={require('../../assets/onboarding1.png')}
							/>
						</View>
						<View color={'transparent'} style={styles.textContent}>
							<DisplayHaas>
								Welcome to the
								<DisplayHaas style={styles.headline1}>
									{' '}
									Atomic Economy.
								</DisplayHaas>
							</DisplayHaas>
							<Text01S style={styles.text}>
								Bitkit Wallet is your toolkit for a new economy, where
								everything is based on Bitcoin.
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
								style={styles.image2}
								source={require('../../assets/onboarding2.png')}
							/>
						</View>
						<View color={'transparent'} style={styles.textContent}>
							<DisplayHaas>
								Bitcoin,
								<DisplayHaas style={styles.headline2}>
									{' '}
									Lightning fast.
								</DisplayHaas>
							</DisplayHaas>
							<Text01S style={styles.text}>
								Send Bitcoin faster than ever. Set up an instant connection and
								pay anyone, anywhere.
							</Text01S>
						</View>
						<SafeAreaInsets type={'bottom'} />
					</View>
				),
			},

			{
				topLeftColor: '#0085FF',
				slide: (): ReactElement => (
					<View color={'transparent'} style={styles.slide}>
						<View color={'transparent'} style={styles.imageContainer}>
							<Image
								style={styles.image2}
								source={require('../../assets/onboarding3.png')}
							/>
						</View>
						<View color={'transparent'} style={styles.textContent}>
							<DisplayHaas>
								Send & receive instantly
								<DisplayHaas style={styles.headline3}>
									{' '}
									with Tether.
								</DisplayHaas>
							</DisplayHaas>
							<Text01S style={styles.text}>
								Use your Bitkit wallet to save and spend traditional currency,
								gifts, rewards, and digital assets.
							</Text01S>
						</View>
						<SafeAreaInsets type={'bottom'} />
					</View>
				),
			},

			{
				topLeftColor: '#F7931A',
				slide: (): ReactElement => (
					<View color={'transparent'} style={styles.slide}>
						<View color={'transparent'} style={styles.imageContainer}>
							<Image
								style={styles.image2}
								source={require('../../assets/onboarding4.png')}
							/>
						</View>
						<View color={'transparent'} style={styles.textContent}>
							<DisplayHaas>
								An open and free web,
								<DisplayHaas style={styles.headline4}>
									{' '}
									for Everyone.
								</DisplayHaas>
							</DisplayHaas>
							<Text01S style={styles.text}>
								Interact with friends or online services by using passwordless
								accounts that you control.
							</Text01S>
						</View>
						<SafeAreaInsets type={'bottom'} />
					</View>
				),
			},

			{
				topLeftColor: '#FFD200',
				slide: (): ReactElement => (
					<View color={'transparent'} style={styles.slide}>
						<View color={'transparent'} style={styles.imageContainer}>
							<Image
								style={styles.image2}
								source={require('../../assets/onboarding5.png')}
							/>
						</View>
						<View color={'transparent'} style={styles.textContent}>
							<DisplayHaas>
								Money gets
								<DisplayHaas style={styles.headline5}> Personal.</DisplayHaas>
							</DisplayHaas>
							<Text01S style={styles.text}>
								Paying or tipping someone takes on a new meaning. Attach
								personal messages to any of your payments.
							</Text01S>
						</View>
						<SafeAreaInsets type={'bottom'} />
					</View>
				),
			},

			{
				topLeftColor: '#FF6600',
				slide: (): ReactElement => (
					<View color={'transparent'} style={styles.slide}>
						<View color={'transparent'} style={styles.imageContainer}>
							<Image
								style={styles.image2}
								source={require('../../assets/onboarding6.png')}
							/>
						</View>
						<View color={'transparent'} style={styles.textContent}>
							<DisplayHaas>
								Money needs
								<DisplayHaas style={styles.headline6}> a Wallet.</DisplayHaas>
							</DisplayHaas>
							<Text01S style={styles.text}>
								Time to set up your Bitkit Wallet!
							</Text01S>

							<View color={'transparent'} style={styles.buttonsContainer}>
								<TouchableOpacity
									style={[styles.button, styles.restoreButton]}
									onPress={onNewWallet}>
									<Text02M>New wallet</Text02M>
								</TouchableOpacity>

								<TouchableOpacity
									style={[styles.button, styles.newButton]}
									onPress={onRestore}>
									<Text02M>Restore</Text02M>
								</TouchableOpacity>
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
			<GlowingBackground topLeft="#75BF72" bottomRight="rgba(0, 133, 255, 0.3)">
				<LoadingWalletScreen />
			</GlowingBackground>
		);
	}

	return (
		<GlowingBackground
			topLeft={slides[index].topLeftColor}
			bottomRight="rgba(0, 133, 255, 0.3)">
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
		display: 'flex',
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
		display: 'flex',
		flexDirection: 'row',
		marginTop: 30,
		// marginHorizontal: 23,
	},
	button: {
		flex: 1,
		backgroundColor: 'rgba(255, 255, 255, 0.06)',
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		height: 56,
		borderRadius: 76,
	},
	restoreButton: {
		marginRight: 6,
	},
	newButton: {
		marginLeft: 6,
		backgroundColor: 'transparent',
		borderColor: 'rgba(255, 255, 255, 0.08)',
		borderWidth: 2,
	},

	slide: {
		flex: 1,
		display: 'flex',
		justifyContent: 'space-between',
		alignItems: 'stretch',
	},
	imageContainer: {
		display: 'flex',
		flex: 1,
		alignItems: 'center',
		paddingVertical: 25,
		justifyContent: 'flex-end',
		width: '100%',
		position: 'relative', // for first slide background image
	},
	image1: {
		position: 'absolute',
		top: 10,
	},
	image2: {},
	textContent: {
		flex: 1,
		display: 'flex',
		paddingHorizontal: 48,
	},
	pageDot: {
		width: 7,
		height: 7,
		borderRadius: 4,
		marginLeft: 4,
		marginRight: 4,
	},
	headline1: {
		color: 'rgba(238, 111, 45, 1)',
		fontWeight: 'bold',
	},
	headline2: {
		color: 'rgba(172, 101, 225, 1)',
		fontWeight: 'bold',
	},
	headline3: {
		color: 'rgba(50, 134, 247, 1)',
		fontWeight: 'bold',
	},
	headline4: {
		color: 'rgba(234, 151, 61, 1)',
		fontWeight: 'bold',
	},
	headline5: {
		color: 'rgba(249, 210, 71, 1)',
		fontWeight: 'bold',
	},
	headline6: {
		color: 'rgba(238, 111, 45, 1)',
		fontWeight: 'bold',
	},
	text: {
		marginTop: 16,
	},
});

export default Slideshow;
