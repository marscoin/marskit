import React, { ReactElement } from 'react';
import { Text, View } from '../../styles/components';
import NavigationHeader from '../../components/NavigationHeader';
import { ScrollView, StyleSheet } from 'react-native';
import Button from '../../components/Button';

const ProfileScreen = ({ navigation }): ReactElement => {
	return (
		<View style={styles.container}>
			<NavigationHeader title="Connect" />
			<View style={styles.content}>
				<Text style={styles.title}>Create your Slashtags Profile</Text>

				<ScrollView />

				<Button onPress={() => {}} text={'Create profile'} size={'lg'} />
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
