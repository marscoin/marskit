import React, { memo, ReactElement, useCallback } from 'react';
import { StyleSheet } from 'react-native';
import {
	View,
	SettingsIcon,
	TouchableOpacity,
	Title,
	ProfileIcon,
} from '../../styles/components';
import { useNavigation } from '@react-navigation/native';
import { useSlashtag } from '../../hooks/slashtags';
import { SlashtagURL } from '../../components/SlashtagURL';
import ProfileImage from '../../components/ProfileImage';
import { truncate } from '../../utils/helpers';

const Header = (): ReactElement => {
	const navigation = useNavigation();

	const { slashtag, profile } = useSlashtag();

	const openProfile = useCallback(
		// @ts-ignore
		() => navigation.navigate('Profile'),
		[navigation],
	);
	const openContacts = useCallback(
		// @ts-ignore
		() => navigation.navigate('Contacts'),
		[navigation],
	);
	const openSettings = useCallback(
		// @ts-ignore
		() => navigation.navigate('Settings'),
		[navigation],
	);

	return (
		<View style={styles.container}>
			<TouchableOpacity activeOpacity={1} onPress={openProfile}>
				<View style={styles.leftColumn}>
					<ProfileImage
						size={32}
						profile={profile}
						id={slashtag?.url.toString()}
						style={styles.profileImage}
					/>
					{profile?.name ? (
						<Title>{truncate(profile?.name, 20)}</Title>
					) : (
						<SlashtagURL url={slashtag?.url.toString()} />
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
