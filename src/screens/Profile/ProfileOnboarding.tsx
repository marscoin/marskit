import React from 'react';
import { Text, View } from '../../styles/components';
import NavigationHeader from '../../components/NavigationHeader';
import { Image } from 'react-native';
import Button from '../../components/Button';
import { TitleHaas } from '../../styles/components';
import { setVisitedProfile } from '../../store/actions/slashtags';
import GlowingBackground from '../../components/GlowingBackground';
import SafeAreaInsets from '../../components/SafeAreaInsets';
import { StyleSheet } from 'react-native';

export const ProfileOnboarding = () => {
	return (
		<GlowingBackground topLeft="#f60">
			<SafeAreaInsets type={'top'} />
			<NavigationHeader title="Profile" />
			<View style={styles.content}>
				<Image
					source={require('../../assets/illustrations/crown.png')}
					style={styles.illustration}
				/>
				<TitleHaas style={styles.headline}>Own your</TitleHaas>
				<TitleHaas style={{ ...styles.headline, color: '#f60' }}>
					own Profile.
				</TitleHaas>
				<Text
					style={{
						marginTop: 8,
						fontSize: 17,
						lineHeight: 22,
						color: '#8E8E93',
						flex: 1,
					}}>
					Use Slashtags to take control of your profile. A sovereign way to
					manage your identity.
				</Text>
				<Button
					textStyle={styles.button}
					text="Continue"
					size="large"
					onPress={() => {
						setVisitedProfile(true);
					}}></Button>
			</View>
		</GlowingBackground>
	);
};

const styles = StyleSheet.create({
	container: {
		display: 'flex',
		flexDirection: 'column',
		backgroundColor: 'transparent',
		padding: 10,
		flex: 1,
	},
	content: {
		flex: 1,
		justifyContent: 'space-between',
		margin: 20,
		marginTop: 0,
		backgroundColor: 'transparent',
	},
	illustration: {
		alignSelf: 'center',
		width: 332,
		height: 332,
	},
	headline: {
		fontSize: 48,
		lineHeight: 48,
	},
	button: {
		fontWeight: '800',
	},
});

export default ProfileOnboarding;
