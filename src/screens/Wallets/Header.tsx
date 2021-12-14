import React, { memo, ReactElement, useCallback } from 'react';
import { StyleSheet } from 'react-native';
import {
	View,
	CameraIcon,
	SettingsIcon,
	TouchableOpacity,
	Title,
} from '../../styles/components';
import { useNavigation } from '@react-navigation/native';

const Header = (): ReactElement => {
	const navigation = useNavigation();

	const openScanner = useCallback(
		// @ts-ignore
		() => navigation.navigate('Scanner'),
		[navigation],
	);
	const openSettings = useCallback(
		// @ts-ignore
		() => navigation.navigate('Settings'),
		[navigation],
	);

	return (
		<View style={styles.container}>
			<View style={styles.leftColumn}>
				<Title>Wallet</Title>
			</View>
			<View style={styles.middleColumn} />
			<View style={styles.rightColumn}>
				<TouchableOpacity
					color="onSurface"
					style={styles.cogIcon}
					activeOpacity={1}
					onPress={openSettings}>
					<SettingsIcon width={25} height={25} />
				</TouchableOpacity>
				<TouchableOpacity
					color="onSurface"
					style={styles.cameraIcon}
					activeOpacity={1}
					onPress={openScanner}>
					<CameraIcon width={23} height={23} />
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
	cogIcon: {
		alignItems: 'center',
		justifyContent: 'center',
		borderRadius: 100,
		padding: 5,
		marginRight: 10,
		minHeight: 40,
		minWidth: 40,
	},
	cameraIcon: {
		alignItems: 'center',
		justifyContent: 'center',
		borderRadius: 100,
		padding: 5,
		minHeight: 40,
		minWidth: 40,
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
		flexDirection: 'row',
		justifyContent: 'flex-end',
		alignItems: 'center',
	},
});

export default memo(Header, () => true);
