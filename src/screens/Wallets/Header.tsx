import React, { memo, ReactElement, useCallback } from 'react';
import { StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import {
	View,
	SettingsIcon,
	TouchableOpacity,
	Title,
	ProfileIcon,
} from '../../styles/components';
import ProfileImage from '../../components/ProfileImage';
import { truncate } from '../../utils/helpers';
import { useSelectedSlashtag } from '../../hooks/slashtags';
import { RootNavigationProp } from '../../navigation/types';

const Header = (): ReactElement => {
	const navigation = useNavigation<RootNavigationProp>();

	const { url, profile } = useSelectedSlashtag();

	const openProfile = useCallback(
		() => navigation.navigate('Profile'),
		[navigation],
	);
	const openContacts = useCallback(
		() => navigation.navigate('Contacts'),
		[navigation],
	);
	const openSettings = useCallback(
		() => navigation.navigate('Settings'),
		[navigation],
	);

	return (
		<View style={styles.container}>
			<TouchableOpacity activeOpacity={1} onPress={openProfile}>
				<View style={styles.leftColumn}>
					<ProfileImage
						size={32}
						url={url}
						image={profile?.image}
						style={styles.profileImage}
					/>
					{profile?.name ? (
						<Title>{truncate(profile?.name, 20)}</Title>
					) : (
						<Title>Your name</Title>
					)}
				</View>
			</TouchableOpacity>
			<View style={styles.middleColumn} />
			<View style={styles.rightColumn}>
				<TouchableOpacity
					style={styles.profileIcon}
					activeOpacity={1}
					onPress={openContacts}>
					<ProfileIcon width={24} height={24} />
				</TouchableOpacity>
				<TouchableOpacity
					style={styles.cogIcon}
					activeOpacity={1}
					onPress={openSettings}>
					<SettingsIcon width={24} height={24} />
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
		marginHorizontal: 16,
		marginBottom: 10,
	},
	cogIcon: {
		alignItems: 'center',
		justifyContent: 'center',
		minHeight: 32,
		minWidth: 32,
	},
	profileIcon: {
		alignItems: 'center',
		justifyContent: 'center',
		marginRight: 10,
		minHeight: 32,
		minWidth: 32,
	},
	leftColumn: {
		flex: 6,
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
	},
	middleColumn: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	rightColumn: {
		flex: 1,
		flexDirection: 'row',
		justifyContent: 'flex-end',
		alignItems: 'center',
	},
	profileImage: {
		marginRight: 16,
	},
});

export default memo(Header, () => true);
