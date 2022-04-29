import React, { ReactElement } from 'react';
import { Image, StyleSheet } from 'react-native';
import { DisplayHaas, Text01S, View } from '../../styles/components';
import SafeAreaInsets from '../../components/SafeAreaInsets';
import GlowingBackground from '../../components/GlowingBackground';
import NavigationHeader from '../../components/NavigationHeader';

const Lightning = (): ReactElement => {
	return (
		<GlowingBackground topLeft="#B95CE8">
			<View color={'transparent'} style={styles.slide}>
				<SafeAreaInsets type={'top'} />
				<NavigationHeader />
				<View color={'transparent'} style={styles.imageContainer}>
					<Image
						style={styles.image2}
						source={require('../../assets/onboarding2.png')}
					/>
				</View>
				<View color={'transparent'} style={styles.textContent}>
					<DisplayHaas>
						Enjoy
						<DisplayHaas style={styles.headline2}> instant </DisplayHaas>
						payments
					</DisplayHaas>
					<Text01S style={styles.text}>
						Open a Lightning connection and send or receive bitcoin instantly.
					</Text01S>
				</View>
				<SafeAreaInsets type={'bottom'} />
			</View>
		</GlowingBackground>
	);
};

const styles = StyleSheet.create({
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
	},
	image2: {},
	textContent: {
		flex: 1,
		display: 'flex',
		paddingHorizontal: 48,
	},
	headline2: {
		color: 'rgba(172, 101, 225, 1)',
		fontWeight: 'bold',
	},
	text: {
		marginTop: 16,
	},
});

export default Lightning;
