import React, { ReactElement, useContext } from 'react';
import { Text, View } from '../../styles/components';
import NavigationHeader from '../../components/NavigationHeader';
import { Pressable, ScrollView, StyleSheet } from 'react-native';
import Button from '../../components/Button';
import { useSelector } from 'react-redux';
import Store from '../../store/types';
import {
	SlashtagsContext,
	TBasicProfile,
} from '@synonymdev/react-native-slashtags';
import { setActiveProfile } from '../../store/actions/slashtags';

const ProfileScreen = ({ navigation }): ReactElement => {
	const slashtags = useContext(SlashtagsContext);

	const { profiles, currentProfileName, sdkState } = useSelector(
		(state: Store) => state.slashtags,
	);

	const onSetActiveProfile = async (
		name: string,
		basicProfile: TBasicProfile,
	): Promise<void> => {
		if (!slashtags.current) {
			return console.warn('Slashtags context not set');
		}

		const state = await slashtags.current.state();
		if (!state.sdkSetup) {
			//TODO get real seed
			const seed = `todo ${new Date().getTime()}`;
			const keyPair = await slashtags.current.generateSeedKeyPair(seed);

			await slashtags.current.setupSDK({
				primaryKey: keyPair.secretKey,
				relays: ['ws://localhost:8888'],
			});
		}

		const res = await slashtags.current.setProfile({ name, basicProfile });

		setActiveProfile(name);
	};

	return (
		<View style={styles.container}>
			<NavigationHeader title="Connect" />
			<View style={styles.content}>
				<Text style={styles.title}>Create your Slashtags Profile</Text>

				<ScrollView>
					{Object.keys(profiles).map((name) => {
						const profile = profiles[name];
						return (
							<Pressable
								style={styles.profileCard}
								key={name}
								onPress={() => onSetActiveProfile(name, profile)}>
								<View color={'transparent'}>
									<Text>{name}</Text>
									<Text>Name: {profile.name}</Text>
									<Text>Name: {profile.type}</Text>
								</View>
								<View color={'transparent'}>
									{name === currentProfileName ? (
										<Text>Active profile</Text>
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
});

export default ProfileScreen;
