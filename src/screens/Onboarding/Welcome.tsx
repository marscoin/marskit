import React, { ReactElement, useEffect, useState } from 'react';
import { Alert, Image, StyleSheet, TouchableOpacity } from 'react-native';
import Swiper from 'react-native-swiper';
import LottieView from 'lottie-react-native';
import {
	View,
	Text01M,
	Text02M,
	Headline,
	Text01S,
	Caption13S,
	Logo,
	Title,
} from '../../styles/components';
import { createNewWallet } from '../../utils/startup';
import { showErrorNotification } from '../../utils/notifications';
import OnboardingBackground from '../../components/OnboardingBackground';
import SafeAreaInsets from '../../components/SafeAreaInsets';
import Card from '../../components/Card';
import LoadingWalletScreen from './Loading';

//TODO use actual boost card once UI is ready
const BoostCard = (): ReactElement => {
	return (
		<Card color={'onSurface'} style={styles.boostCard}>
			<View style={styles.boostCol1} color={'transparent'}>
				<View color={'surface'} style={styles.boostIcon}>
					<LottieView
						autoPlay
						loop
						source={require('../../assets/animations/boost.json')}
					/>
				</View>
				<View style={styles.boostTextContainer} color={'transparent'}>
					<Text02M style={styles.boostTitle}>Receiving: ₿0.2846</Text02M>
					<Caption13S>Confirms in 20-40min</Caption13S>
				</View>
			</View>

			<View color={'surface'} style={styles.boostButton}>
				<Text02M color={'brand'}>Boost</Text02M>
			</View>
		</Card>
	);
};

const Dot = ({ active }: { active?: boolean }): ReactElement => {
	return <View color={active ? 'white' : 'gray2'} style={styles.pageDot} />;
};

const OnboardingWelcomeScreen = ({
	navigation,
}: {
	navigation: any;
}): ReactElement => {
	const [showSlash, setShowSplash] = useState(true);
	const [isCreatingWallet, setIsCreatingWallet] = useState(false);

	useEffect(() => {
		setTimeout(() => setShowSplash(false), 1000);
	}, []);

	const onSkip = async (): Promise<void> => {
		setIsCreatingWallet(true);
		const res = await createNewWallet();
		if (res.isErr()) {
			setIsCreatingWallet(false);
			showErrorNotification({
				title: 'Wallet creation failed',
				message: res.error.message,
			});
		}
	};

	const onCreateAccount = (): void => navigation.navigate('CreateAccount');

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
				text: 'Cancel',
				onPress: (): void => {},
				style: 'cancel',
			},
		]);
	};

	if (isCreatingWallet) {
		return <LoadingWalletScreen />;
	}

	const Splash = (): ReactElement => {
		return (
			<View color={'transparent'} style={styles.splashContent}>
				<Logo width={82} height={82} />
				<Title style={styles.splashTitle}>keyspace</Title>
			</View>
		);
	};

	const Content = (): ReactElement => {
		return (
			<>
				<View color={'transparent'} style={styles.content}>
					<View color={'transparent'} style={styles.header}>
						<Logo />
					</View>

					<View color={'transparent'} style={styles.headerButtonContainer}>
						<TouchableOpacity style={styles.skipButton} onPress={onSkip}>
							<Text01M color={'gray1'}>Skip</Text01M>
						</TouchableOpacity>
					</View>

					<Swiper dot={<Dot />} activeDot={<Dot active />} loop={false}>
						<View color={'transparent'} style={styles.slide}>
							<View color={'transparent'} style={styles.imageContainer1}>
								<Image
									style={styles.image1}
									resizeMode={'contain'}
									source={require('../../assets/onboarding1.png')}
								/>
							</View>
							<View color={'transparent'} style={styles.textContent}>
								<Headline style={styles.headline}>
									Welcome to the{'\n'}Atomic Economy.
								</Headline>
								<Text01S style={styles.text}>
									Spectrum Wallet is your toolbelt for a new economy, where
									everything is based on Bitcoin.
								</Text01S>
							</View>
						</View>

						<View color={'transparent'} style={styles.slide}>
							<View color={'transparent'} style={styles.imageContainer2}>
								<Image
									style={styles.image2}
									width={120}
									resizeMode={'contain'}
									source={require('../../assets/onboarding2.png')}
								/>

								<BoostCard />
							</View>

							<View color={'transparent'} style={styles.textContent}>
								<Headline style={styles.headline}>
									Lightning fast.{'\n'}Boost any transaction.
								</Headline>
								<Text01S style={styles.text}>
									Take advantage of ⚡ instant transactions, and transaction
									acceleration features.
								</Text01S>
							</View>
						</View>
					</Swiper>

					<View style={styles.buttonsContainer} color={'transparent'}>
						<TouchableOpacity
							style={{ ...styles.button, ...styles.restoreButton }}
							onPress={onRestore}>
							<Text02M>Restore wallet</Text02M>
						</TouchableOpacity>

						<TouchableOpacity
							style={{ ...styles.button, ...styles.newButton }}
							onPress={onCreateAccount}>
							<Text02M color={'brand'}>New Account</Text02M>
						</TouchableOpacity>
					</View>
				</View>
			</>
		);
	};

	return (
		<OnboardingBackground>
			<SafeAreaInsets type={'top'} />
			{showSlash ? <Splash /> : <Content />}
			<SafeAreaInsets type={'bottom'} />
		</OnboardingBackground>
	);
};

const styles = StyleSheet.create({
	splashContent: {
		flex: 1,
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
	},
	splashTitle: {
		marginTop: 24,
	},
	content: {
		flex: 1,
		display: 'flex',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	header: {
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
		width: '100%',
		alignContent: 'flex-end',
		justifyContent: 'center',
	},
	headerButtonContainer: {
		display: 'flex',
		flexDirection: 'row',
		width: '100%',
		justifyContent: 'flex-end',
		paddingHorizontal: 28,
		position: 'absolute',
	},
	skipButton: {
		backgroundColor: 'transparent',
	},
	buttonsContainer: {
		display: 'flex',
		flexDirection: 'row',
		marginTop: 50,
		marginHorizontal: 23,
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
	},

	//TODO
	slide: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		display: 'flex',

		// width: Dimensions.get('screen').width,
	},
	imageContainer1: {
		display: 'flex',
		flex: 4,
		paddingTop: 20,
		justifyContent: 'center',
		alignItems: 'center',
		width: '100%',
	},
	imageContainer2: {
		display: 'flex',
		flex: 4,
		paddingTop: 20,
		// paddingHorizontal: 33,
		justifyContent: 'center',
		alignItems: 'flex-start',
		width: '100%',
	},
	image1: {
		flex: 1,
		left: -10,
	},
	image2: {
		flex: 1,
	},
	textContent: {
		flex: 5,
		display: 'flex',
		justifyContent: 'center',
		paddingHorizontal: 20,
	},
	pageDot: {
		width: 7,
		height: 7,
		borderRadius: 4,
		marginLeft: 4,
		marginRight: 4,
	},
	headline: {
		textAlign: 'center',
	},
	text: {
		marginTop: 16,
		textAlign: 'center',
	},
	boostCard: {
		position: 'absolute',
		display: 'flex',
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingVertical: 17,
		paddingHorizontal: 9,
		top: '50%',
		maxWidth: 300,
	},
	boostCol1: {
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
	},
	boostIcon: {
		width: 40,
		height: 40,
		borderRadius: 13,
		paddingRight: 4,
	},
	boostButton: {
		paddingHorizontal: 16,
		paddingVertical: 5.5,
		borderRadius: 10,
	},
	boostTitle: {
		marginBottom: 2,
	},
	boostTextContainer: {
		marginLeft: 10,
	},
});

export default OnboardingWelcomeScreen;
