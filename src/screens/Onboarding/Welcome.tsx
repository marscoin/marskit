import React, { ReactElement } from 'react';
import { StyleSheet } from 'react-native';
import { FadeIn } from 'react-native-reanimated';
import {
	DisplayHaas,
	Text01S,
	Text01B,
	View,
	AnimatedView,
} from '../../styles/components';
import GlowingBackground from '../../components/GlowingBackground';
import SafeAreaInsets from '../../components/SafeAreaInsets';
import Button from '../../components/Button';
import SynonymLogo from '../../assets/synonym-logo.svg';
import BitKitRoundLogo from '../../assets/bitkit-round-logo.svg';
import useColors from '../../hooks/colors';

const OnboardingWelcomeScreen = ({
	navigation,
}: {
	navigation: any;
}): ReactElement => {
	const colors = useColors();
	const onSkipIntro = (): void =>
		navigation.navigate('Slideshow', { skipIntro: true });
	const onGetStarted = (): void => navigation.navigate('Slideshow');

	return (
		<GlowingBackground topLeft={colors.blue}>
			<View color={'transparent'} style={styles.content}>
				<View color={'transparent'} style={styles.slide}>
					<AnimatedView
						style={styles.imageContainer}
						color={'transparent'}
						entering={FadeIn.duration(1000)}>
						<BitKitRoundLogo width="450" />
					</AnimatedView>

					<View color={'transparent'} style={styles.textContent}>
						<DisplayHaas>Bitkit</DisplayHaas>

						<Text01B style={styles.text1}>
							Bitcoin everything.{'\n'}
							Bitcoin everywhere.
						</Text01B>

						<Text01S color="gray1" style={styles.text2}>
							Bitkit puts you in control over your money, contacts, and web
							accounts.
						</Text01S>

						<View style={styles.buttonsContainer} color={'transparent'}>
							<Button
								size="large"
								onPress={onGetStarted}
								text="Get started"
								style={[styles.button, styles.restoreButton]}
							/>
							<Button
								size="large"
								variant="secondary"
								onPress={onSkipIntro}
								text="Skip intro"
								style={[styles.button, styles.skipButton]}
							/>
						</View>

						<View style={styles.logoContainer} color={'transparent'}>
							<SynonymLogo width={'80'} />
						</View>
						<SafeAreaInsets type={'bottom'} />
					</View>
				</View>
			</View>
		</GlowingBackground>
	);
};

const styles = StyleSheet.create({
	content: {
		flex: 1,
		justifyContent: 'space-between',
	},
	buttonsContainer: {
		flexDirection: 'row',
		marginTop: 40,
	},
	button: {
		flex: 1,
	},
	restoreButton: {
		marginRight: 6,
	},
	skipButton: {
		marginLeft: 6,
	},
	logoContainer: {
		flexDirection: 'row',
		justifyContent: 'center',
		marginTop: 40,
	},

	slide: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	imageContainer: {
		flex: 4,
		paddingTop: 20,
		justifyContent: 'center',
		alignItems: 'center',
		width: '100%',
	},
	textContent: {
		flex: 3,
		justifyContent: 'space-between',
		width: '100%',
		paddingHorizontal: 48,
	},
	text1: {
		marginTop: 8,
	},
	text2: {
		marginTop: 20,
	},
});

export default OnboardingWelcomeScreen;
