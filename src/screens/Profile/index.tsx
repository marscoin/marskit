import React, { ReactElement } from 'react';
import { Text, View } from '../../styles/components';
import NavigationHeader from '../../components/NavigationHeader';
import { StyleSheet } from 'react-native';
import Button from '../../components/Button';

const ProfileScreen = ({ navigation }): ReactElement => {
	return (
		<View style={styles.container}>
			<NavigationHeader title="Connect" />
			<View style={styles.content}>
				<Text>Create your Slashtags Profile</Text>

				<Text>TODO list of profiles</Text>

				<Button
					onPress={(): void => navigation.navigate('UpdateProfile')}
					text={'Create profile'}
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
});

export default ProfileScreen;
