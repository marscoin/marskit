import React, { ReactElement } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { FadeIn } from 'react-native-reanimated';
import {
	DisplayHaas,
	Text01S,
	Text02M,
	View,
	AnimatedView,
} from '../../styles/components';
import GlowingBackground from '../../components/GlowingBackground';
import SafeAreaInsets from '../../components/SafeAreaInsets';
import SynonymLogo from '../../assets/synonym-logo.svg';
import BitKitRoundLogo from '../../assets/bitkit-round-logo.svg';

const OnboardingWelcomeScreen = ({
	navigation,
}: {
	navigation: any;
}): ReactElement => {
	const onSkipIntro = (): void =>
		navigation.navigate('Slideshow', { skipIntro: true });
	const onGetStarted = (): void => navigation.navigate('Slideshow');

	return (
		<GlowingBackground
			topLeft="rgba(0, 133, 255, 1)"
			bottomRight="rgba(0, 133, 255, 0.3)">
			<SafeAreaInsets type={'top'} />
			<View color={'transparent'} style={styles.content}>
				<View color={'transparent'} style={styles.slide}>
					<AnimatedView
						color={'transparent'}
						style={styles.imageContainer1}
						entering={FadeIn.duration(1000)}>
						<BitKitRoundLogo width="450" />
					</AnimatedView>
					<View color={'transparent'} style={styles.textContent}>
						<DisplayHaas>Bitkit</DisplayHaas>
						<Text01S style={styles.text}>
							Regain control over your money and your life with Bitkit Wallet.
						</Text01S>
					</View>
				</View>

				<View style={styles.buttonsContainer} color={'transparent'}>
					<TouchableOpacity
						style={[styles.button, styles.restoreButton]}
						onPress={onGetStarted}>
						<Text02M>Get started</Text02M>
					</TouchableOpacity>

					<TouchableOpacity
						style={[styles.button, styles.skipButton]}
						onPress={onSkipIntro}>
						<Text02M>Skip intro</Text02M>
					</TouchableOpacity>
				</View>

				<View style={styles.logoContainer} color={'transparent'}>
					<SynonymLogo width={'80'} />
				</View>
			</View>
			<SafeAreaInsets type={'bottom'} />
		</GlowingBackground>
	);
};

const styles = StyleSheet.create({
	content: {
		flex: 1,
		display: 'flex',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	buttonsContainer: {
		display: 'flex',
		flexDirection: 'row',
		marginTop: 40,
		marginHorizontal: 48,
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
	skipButton: {
		marginLeft: 6,
		backgroundColor: 'transparent',
		borderColor: 'rgba(255, 255, 255, 0.08)',
		borderWidth: 2,
	},
	logoContainer: {
		display: 'flex',
		flexDirection: 'row',
		marginTop: 50,
		marginHorizontal: 48,
		marginBottom: 20,
	},

	slide: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		display: 'flex',
	},
	imageContainer1: {
		display: 'flex',
		flex: 10,
		paddingTop: 20,
		justifyContent: 'center',
		alignItems: 'center',
		width: '100%',
	},
	textContent: {
		flex: 3,
		display: 'flex',
		paddingHorizontal: 48,
	},
	text: {
		marginTop: 8,
	},
});

export default OnboardingWelcomeScreen;
