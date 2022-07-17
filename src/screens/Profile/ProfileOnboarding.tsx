import React from 'react';
import { Text, View } from '../../styles/components';
import NavigationHeader from '../../components/NavigationHeader';
import { Image } from 'react-native';
import Button from '../../components/Button';
import { Title } from '../../styles/components';
import GlowingBackground from '../../components/GlowingBackground';
import SafeAreaInsets from '../../components/SafeAreaInsets';
import { StyleSheet } from 'react-native';

export const ProfileOnboarding = ({ navigation }): JSX.Element => {
	return (
		<GlowingBackground topLeft="brand">
			<SafeAreaInsets type={'top'} />
			<NavigationHeader
				title="Profile"
				displayBackButton={false}
				onClosePress={(): void => {
					navigation.navigate('Tabs');
				}}
			/>
			<View style={styles.content}>
				<Image
					source={require('../../assets/illustrations/crown.png')}
					style={styles.illustration}
				/>
				<Title style={styles.headline}>Own your</Title>
				<Title color="brand" style={styles.headline}>
					Social Profile.
				</Title>
				<Text color="gray1" style={styles.introText}>
					Use Slashtags to control your public profile and links, so your
					contacts can reach you or pay you anytime.
				</Text>
				<Button
					textStyle={styles.button}
					text="Continue"
					size="large"
					onPress={(): void => {
						navigation.navigate('ProfileEdit');
					}}
				/>
			</View>
		</GlowingBackground>
	);
};

const styles = StyleSheet.create({
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
	introText: {
		marginTop: 8,
		fontSize: 17,
		lineHeight: 22,
		flex: 1,
	},
	button: {
		fontWeight: '800',
	},
});

export default ProfileOnboarding;
