import React, { useState } from 'react';
import {
	CopyIcon,
	InfoIcon,
	PencileIcon,
	QrPage,
	ShareIcon,
	Text,
	UsersIcon,
	View,
} from '../../styles/components';
import NavigationHeader from '../../components/NavigationHeader';
import { StyleSheet, useWindowDimensions, Share } from 'react-native';
import Button from '../../components/Button';
import { useSelector } from 'react-redux';
import SafeAreaInsets from '../../components/SafeAreaInsets';
import ProfileCard from '../../components/ProfileCard';
import {
	ProfileIntro,
	PaymentsFromContacts,
	OfflinePayments,
} from './ProfileOnboarding';
import QR from 'react-native-qrcode-svg';
import { BasicProfile } from '../../store/types/slashtags';
import { TouchableOpacity } from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import ProfileLinks from '../../components/ProfileLinks';
import ProfileEdit from './ProfileEdit';
import Store from '../../store/types';
import { useSelectedSlashtag } from '../../hooks/slashtags';

export const Profile = ({ navigation }): JSX.Element => {
	const onboardingProfileStep = useSelector(
		(state: Store) => state.slashtags.onboardingProfileStep,
	);

	switch (onboardingProfileStep) {
		case 'Intro':
			return <ProfileIntro navigation={navigation} />;
		case 'InitialEdit':
			return <ProfileEdit navigation={navigation} />;
		case 'PaymentsFromContacts':
			return <PaymentsFromContacts navigation={navigation} />;
		case 'OfflinePayments':
			return <OfflinePayments navigation={navigation} />;
		case 'Done':
			return <ProfileScreen navigation={navigation} />;
		default:
			return <ProfileScreen navigation={navigation} />;
	}
};

const ProfileScreen = ({ navigation }): JSX.Element => {
	const { url, profile } = useSelectedSlashtag();

	const [view, setView] = useState('qr');

	function switchView(): void {
		view === 'details' ? setView('qr') : setView('details');
	}

	return (
		<View style={styles.container}>
			<SafeAreaInsets type={'top'} />
			<NavigationHeader
				title="Profile"
				displayBackButton={false}
				onClosePress={(): void => {
					navigation.navigate('Tabs');
				}}
			/>
			<View style={styles.content}>
				<ProfileCard url={url} profile={profile} />
				<View style={styles.divider} />
				<View style={styles.bottom}>
					<View style={styles.bottomHeader}>
						<IconButton onPress={switchView}>
							{view === 'qr' ? (
								<InfoIcon height={24} width={24} color="brand" />
							) : (
								<QrPage height={24} width={24} color="brand" />
							)}
						</IconButton>
						<IconButton
							onPress={(): void => {
								url && Clipboard.setString(url);
							}}>
							<CopyIcon height={24} width={24} color="brand" />
						</IconButton>
						<IconButton
							onPress={(): void => {
								url &&
									Share.share({
										title: 'Share Slashtag url',
										message: url,
									});
							}}>
							<ShareIcon height={24} width={24} color="brand" />
						</IconButton>
						<IconButton
							onPress={(): void => {
								navigation.navigate('ProfileEdit');
							}}>
							<PencileIcon height={24} width={24} color="brand" />
						</IconButton>
						<IconButton
							onPress={(): void => {
								navigation.navigate('Contacts');
							}}>
							<UsersIcon height={24} width={24} color="brand" />
						</IconButton>
					</View>
					{view === 'details' ? (
						<ProfileLinks
							links={profile?.links}
							style={styles.profileDetails}
						/>
					) : (
						<QRView url={url as string} profile={profile} />
					)}
				</View>

				<Button
					textStyle={styles.button}
					size="large"
					text={view === 'details' ? 'Show QR code' : 'Profile details'}
					onPress={switchView}
				/>
			</View>
		</View>
	);
};

const IconButton = ({
	children,
	onPress,
}: {
	children?: any;
	onPress?: () => void;
}): JSX.Element => {
	return (
		<TouchableOpacity
			activeOpacity={0.7}
			onPress={onPress}
			style={styles.iconContainer}>
			{children}
		</TouchableOpacity>
	);
};

const QRView = ({
	url,
	profile,
}: {
	url: string;
	profile?: BasicProfile;
}): JSX.Element => {
	const { width } = useWindowDimensions();
	return (
		<View style={styles.qrViewContainer}>
			<View style={styles.qrContainer}>
				<QR
					value={url}
					size={(width * 2) / 3}
					logo={{ uri: profile?.image || '' }}
					logoBackgroundColor={profile?.image ? '#fff' : 'transparent'}
					logoSize={70}
					logoBorderRadius={999}
					logoMargin={10}
					quietZone={20}
				/>
			</View>
			<Text style={styles.qrViewNote}>Scan to add {profile?.name}</Text>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	content: {
		flex: 1,
		justifyContent: 'space-between',
		margin: 20,
		marginTop: 0,
		backgroundColor: 'transparent',
	},
	divider: {
		height: 2,
		backgroundColor: 'rgba(255, 255, 255, 0.1)',

		marginTop: 16,
		marginBottom: 16,
	},
	bottom: {
		flex: 1,
		display: 'flex',
		flexDirection: 'column',
	},
	button: {
		fontWeight: '800',
	},
	iconContainer: {
		width: 48,
		height: 48,
		borderRadius: 9999,
		backgroundColor: 'rgba(255, 255, 255, 0.08)',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		marginRight: 16,
	},
	bottomHeader: {
		display: 'flex',
		flexDirection: 'row',
	},
	qrViewContainer: {
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		justifyContent: 'center',
		flex: 1,
	},
	qrContainer: {
		borderRadius: 10,
		overflow: 'hidden',
	},
	qrViewNote: {
		marginTop: 16,
		fontSize: 15,
		lineHeight: 20,
	},
	profileDetails: {
		marginTop: 32,
	},
});

export default Profile;
