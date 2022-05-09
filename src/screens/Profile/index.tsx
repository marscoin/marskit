import React, { ReactElement } from 'react';
import { Text, View } from '../../styles/components';
import NavigationHeader from '../../components/NavigationHeader';
import { Pressable, ScrollView, StyleSheet } from 'react-native';
import Button from '../../components/Button';
import { useSelector } from 'react-redux';
import Store from '../../store/types';
import { setActiveProfile } from '../../store/actions/slashtags';

const ProfileScreen = ({ navigation }): ReactElement => {
	const { profiles, currentProfileName } = useSelector(
		(state: Store) => state.slashtags,
	);

	return (
		<View style={styles.container}>
			<NavigationHeader title="Connect" />
			<View style={styles.content}>
				<Text style={styles.title}>Create your Slashtags Profile</Text>

				<ScrollView>
					{Object.keys(profiles).map((name) => {
						const { basicProfile, slashtag } = profiles[name];
						return (
							<Pressable
								style={styles.profileCard}
								key={name}
								onPress={(): void => setActiveProfile(name)}>
								<View style={styles.col1} color={'transparent'}>
									<Text>{name}</Text>
									<Text>Name: {basicProfile.name}</Text>
									<Text>Type: {basicProfile.type}</Text>
									<Text style={styles.slashtag}>{slashtag}</Text>
								</View>
								<View color={'transparent'}>
									{name === currentProfileName ? (
										<Text>Active profile ✅</Text>
									) : null}
								</View>
							</Pressable>
						);
					})}
				</ScrollView>

				<Button
					onPress={(): void => navigation.navigate('UpdateProfile')}
					text={'Create profile'}
					size={'lg'}
				/>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	content: {
		flex: 1,
		justifyContent: 'space-between',
		margin: 20,
	},
	title: {
		fontSize: 18,
		marginBottom: 20,
	},
	profileCard: {
		borderRadius: 10,
		marginBottom: 10,
		backgroundColor: 'gray',
		padding: 10,
		display: 'flex',
		flexDirection: 'row',
		justifyContent: 'space-between',
	},
	col1: { flex: 1 },
	slashtag: {
		fontSize: 10,
	},
});

export default ProfileScreen;
