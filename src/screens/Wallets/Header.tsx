import React, { memo, ReactElement, useCallback } from 'react';
import { StyleSheet } from 'react-native';
import {
	View,
	SettingsIcon,
	TouchableOpacity,
	TitleHaas,
	ProfileIcon,
} from '../../styles/components';
import { useNavigation } from '@react-navigation/native';

const Header = (): ReactElement => {
	const navigation = useNavigation();

	const openProfile = useCallback(
		// @ts-ignore
		() => navigation.navigate('ProfileRoot'),
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
				<TitleHaas>Wallet</TitleHaas>
			</View>
			<View style={styles.middleColumn} />
			<View style={styles.rightColumn}>
				<TouchableOpacity
					style={styles.profileIcon}
					activeOpacity={1}
					onPress={openProfile}>
					<ProfileIcon width={23} height={23} />
				</TouchableOpacity>
				<TouchableOpacity
					style={styles.cogIcon}
					activeOpacity={1}
					onPress={openSettings}>
					<SettingsIcon width={25} height={25} />
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
		minHeight: 30,
		minWidth: 30,
	},
	profileIcon: {
		alignItems: 'center',
		justifyContent: 'center',
		marginRight: 10,
		minHeight: 30,
		minWidth: 30,
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
