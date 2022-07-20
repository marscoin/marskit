import React from 'react';
import { Text, Text01B, View } from '../../styles/components';
import NavigationHeader from '../../components/NavigationHeader';
import { Image } from 'react-native';
import Button from '../../components/Button';
import { Title } from '../../styles/components';
import GlowingBackground from '../../components/GlowingBackground';
import SafeAreaInsets from '../../components/SafeAreaInsets';
import { StyleSheet } from 'react-native';
import { setVisitedContacts } from '../../store/actions/slashtags';

export const ContactsOnboarding = ({ navigation }): JSX.Element => {
	return (
		<GlowingBackground topLeft="brand">
			<SafeAreaInsets type={'top'} />
			<NavigationHeader
				title="Contacts"
				displayBackButton={false}
				onClosePress={(): void => {
					navigation.navigate('Tabs');
				}}
			/>
			<View style={styles.content}>
				<Image
					source={require('../../assets/illustrations/book.png')}
					style={styles.illustration}
				/>
				<Title style={styles.headline}>Dynamic</Title>
				<Title color="brand" style={styles.headline}>
					Contacts.
				</Title>
				<Text color="gray1" style={styles.introText}>
					Use Slashtags to get automatic updates from your contacts, pay them,
					and follow their public profiles
				</Text>
				<Button
					text={<Text01B>Add your first contact</Text01B>}
					size="large"
					onPress={(): void => {
						setVisitedContacts();
					}}></Button>
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
});

export default ContactsOnboarding;
