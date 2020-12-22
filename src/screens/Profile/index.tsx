import React, { ReactElement } from 'react';
import { Text, TouchableOpacity, View } from '../../styles/components';
import NavigationHeader from '../../components/NavigationHeader';
import { StyleSheet } from 'react-native';

const ProfileScreen = ({ navigation }): ReactElement => {
	return (
		<View style={styles.container}>
			<NavigationHeader title="Profile" isHome={true} />
			<View style={styles.content}>
				<Text>Profile!</Text>
				<TouchableOpacity
					onPress={(): void => navigation.navigate('ProfileDetail')}
					style={styles.button}>
					<Text>Go To Nested Profile Screen</Text>
				</TouchableOpacity>
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
		justifyContent: 'center',
		alignItems: 'center',
	},
	button: {
		marginTop: 20,
	},
});

export default ProfileScreen;
