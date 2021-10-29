import React, { ReactElement } from 'react';
import { Text, View } from '../../styles/components';
import NavigationHeader from '../../components/NavigationHeader';
import { StyleSheet } from 'react-native';

const TempSettings = (): ReactElement => {
	return (
		<View color={'surface'} style={styles.container}>
			<NavigationHeader title="Nested Settings" />
			<View style={styles.content}>
				<Text>Temporary Nested Settings Screen</Text>
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
});

export default TempSettings;
