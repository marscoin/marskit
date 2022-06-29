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
import { useSlashtags } from '../../hooks/slashtags';
import { SlashtagURL } from '../../components/SlashtagURL';
import ProfileImage from '../../components/ProfileImage';
import { truncate } from '../../utils/helpers';

const Header = (): ReactElement => {
	const navigation = useNavigation();
	const { profile } = useSlashtags();

	const openProfile = useCallback(
		// @ts-ignore
		() => navigation.navigate('Profile'),
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
						style={{ marginRight: 16 }}></ProfileImage>
					{profile?.name ? (
						<TitleHaas>{truncate(profile?.name, 20)}</TitleHaas>
					) : (
						<SlashtagURL url={profile?.id} />
					)}
				</View>
			</TouchableOpacity>
			<View style={styles.middleColumn} />
			<View style={styles.rightColumn}>
				<TouchableOpacity
					style={styles.profileIcon}
					activeOpacity={1}
					onPress={openProfile}>
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
		marginHorizontal: 10,
		marginBottom: 10,
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
});

export default memo(Header, () => true);
