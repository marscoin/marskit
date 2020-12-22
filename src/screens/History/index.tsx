import React, { memo, ReactElement } from 'react';
import { Text, TouchableOpacity, View } from '../../styles/components';
import NavigationHeader from '../../components/NavigationHeader';
import { StyleSheet } from 'react-native';

const HistoryScreen = ({ navigation }): ReactElement => {
	return (
		<View style={styles.container}>
			<NavigationHeader title="History" isHome={true} />
			<View style={styles.content}>
				<Text>History!</Text>
				<TouchableOpacity
					onPress={(): void => navigation.navigate('HistoryDetail')}
					style={styles.button}>
					<Text>Go To Nested History Screen</Text>
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

export default memo(HistoryScreen);
