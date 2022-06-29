import React, { useState } from 'react';
import { View } from '../../styles/components';
import NavigationHeader from '../../components/NavigationHeader';
import { StyleSheet } from 'react-native';
import Button from '../../components/Button';
import Store from '../../store/types';
import { useSelector } from 'react-redux';
import { useSlashtags } from '../../hooks/slashtags';
import SafeAreaInsets from '../../components/SafeAreaInsets';
import ProfileCard from '../../components/ProfileCard';
import ProfileOnboarding from './ProfileOnboarding';

export const Profile = ({ navigation }) => {
	const visitedProfile = useSelector(
		(store: Store) => store.slashtags.visitedProfile,
	);

	const { profile } = useSlashtags();

	return visitedProfile ? (
		<View style={styles.container}>
			<SafeAreaInsets type={'top'} />
			<NavigationHeader title="Profile" />
			<View style={styles.content}>
				<ProfileCard
					id={profile?.id}
					profile={profile}
					actions={[
						{
							label: 'Edit profile',
							onPress: () => {
								navigation.navigate('ProfileEdit');
							},
						},
					]}
				/>
				<View style={styles.divider} />
				<View style={styles.bottom}></View>
				<Button
					text="Edit profile"
					onPress={() => {
						navigation.navigate('ProfileEdit');
					}}></Button>
			</View>
		</View>
	) : (
		<ProfileOnboarding />
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
		marginTop: 0,
		backgroundColor: 'transparent',
	},
	title: {
		fontSize: 18,
		marginBottom: 20,
	},
	col1: { flex: 1 },
	slashtag: {
		fontSize: 10,
	},
	divider: {
		height: 2,
		backgroundColor: 'rgba(255, 255, 255, 0.1)',

		marginTop: 16,
		marginBottom: 16,
	},
	bottom: {
		flex: 1,
		display: 'flex',
		flexDirection: 'column',
	},
	button: {
		fontWeight: '800',
	},
});

export default Profile;
