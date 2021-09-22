import React, { ReactElement } from 'react';
import { Text, View } from '../../styles/components';
import NavigationHeader from '../../components/NavigationHeader';
import { StyleSheet } from 'react-native';
import SafeAreaView from '../../components/SafeAreaView';

const TempSettings = (): ReactElement => {
	return (
		<SafeAreaView>
			<NavigationHeader title="Nested Settings" />
			<View style={styles.content}>
				<Text>Temporary Nested Settings Screen</Text>
			</View>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	content: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
});

export default TempSettings;
