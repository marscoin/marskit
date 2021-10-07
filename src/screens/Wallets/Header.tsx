import React, { memo, ReactElement, useCallback } from 'react';
import { StyleSheet } from 'react-native';
import {
	View,
	CameraIcon,
	SettingsIcon,
	TouchableOpacity,
	Text01M,
} from '../../styles/components';
import { useNavigation } from '@react-navigation/native';

const Header = (): ReactElement => {
	const navigation = useNavigation();

	const openScanner = useCallback(
		() => navigation.navigate('Scanner'),
		[navigation],
	);
	const openSettings = useCallback(
		() => navigation.navigate('Settings'),
		[navigation],
	);

	return (
		<View style={styles.container}>
			<View style={styles.leftColumn}>
				<TouchableOpacity
					style={styles.leftIcon}
					activeOpacity={1}
					onPress={openSettings}>
					<SettingsIcon />
				</TouchableOpacity>
			</View>
			<View style={styles.middleColumn}>
				<Text01M>Wallet</Text01M>
			</View>
			<View style={styles.rightColumn}>
				<TouchableOpacity
					style={styles.rightIcon}
					activeOpacity={1}
					onPress={openScanner}>
					<CameraIcon />
				</TouchableOpacity>
			</View>
		</View>
	);
};
const styles = StyleSheet.create({
	container: {
		flexDirection: 'row',
		justifyContent: 'flex-end',
		alignItems: 'center',
		marginTop: 15,
		marginHorizontal: 10,
		marginBottom: 20,
	},
	leftIcon: {
		left: '8.7%',
	},
	rightIcon: {
		right: '8.7%',
	},
	leftColumn: {
		flex: 1,
		justifyContent: 'center',
	},
	middleColumn: {
		flex: 1.5,
		justifyContent: 'center',
		alignItems: 'center',
	},
	rightColumn: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'flex-end',
	},
});

export default memo(Header, () => true);
