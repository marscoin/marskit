import React, { useState } from 'react';
import {
	CopyIcon,
	InfoIcon,
	PencileIcon,
	PenIcon,
	QrPage,
	ShareIcon,
	Text,
	UsersIcon,
	View,
} from '../../styles/components';
import NavigationHeader from '../../components/NavigationHeader';
import { StyleSheet, useWindowDimensions, Share } from 'react-native';
import Button from '../../components/Button';
import Store from '../../store/types';
import { useSelector } from 'react-redux';
import { useSlashtags } from '../../hooks/slashtags';
import SafeAreaInsets from '../../components/SafeAreaInsets';
import ProfileCard from '../../components/ProfileCard';
import ProfileOnboarding from './ProfileOnboarding';
import QR from 'react-native-qrcode-svg';
import { BasicProfile } from '../../store/types/slashtags';
import { TouchableOpacity } from 'react-native-gesture-handler';
import Clipboard from '@react-native-clipboard/clipboard';

export const Profile = ({ navigation }) => {
	const visitedProfile = useSelector(
		(store: Store) => store.slashtags.visitedProfile,
	);

	const [view, setView] = useState('qr');

	function switchView() {
		view === 'details' ? setView('qr') : setView('details');
	}

	const { profile } = useSlashtags();

	return visitedProfile ? (
		<View style={styles.container}>
			<SafeAreaInsets type={'top'} />
			<NavigationHeader title="Profile" />
			<View style={styles.content}>
				<ProfileCard id={profile?.id} profile={profile} />
				<View style={styles.divider} />
				<View style={styles.bottom}>
					<View style={styles.bottomHeader}>
						<IconButton
							onPress={() => {
								profile?.id && Clipboard.setString(profile.id);
							}}>
							<CopyIcon height={24} width={24} color="brand" />
						</IconButton>
						<IconButton
							onPress={() => {
								profile?.id &&
									Share.share({
										title: 'Share Slashtag url',
										message: profile.id,
									});
							}}>
							<ShareIcon height={24} width={24} color="brand" />
						</IconButton>
						<IconButton
							onPress={() => {
								navigation.navigate('ProfileEdit');
							}}>
							<PencileIcon height={24} width={24} color="brand" />
						</IconButton>
						<IconButton onPress={switchView}>
							{view === 'qr' ? (
								<InfoIcon height={24} width={24} color="brand" />
							) : (
								<QrPage height={24} width={24} color="brand" />
							)}
						</IconButton>
						<IconButton
							onPress={() => {
								navigation.navigate('Contacts');
							}}>
							<UsersIcon height={24} width={24} color="brand" />
						</IconButton>
					</View>
					{view === 'details' ? (
						<DetailsView profile={profile} />
					) : (
						<QRView profile={profile} />
					)}
				</View>

				<Button
					textStyle={styles.button}
					size="large"
					text={view === 'details' ? 'Show QR code' : 'Profile details'}
					onPress={switchView}></Button>
			</View>
		</View>
	) : (
		<ProfileOnboarding navigation={navigation} />
	);
};

const IconButton = ({
	children,
	onPress,
}: {
	children?: any;
	onPress?: () => void;
}) => {
	return (
		<TouchableOpacity
			activeOpacity={0.7}
			onPress={onPress}
			style={styles.iconContainer}>
			{children}
		</TouchableOpacity>
	);
};

const QRView = ({ profile }: { profile?: BasicProfile }) => {
	const { width } = useWindowDimensions();
	return (
		<View
			style={{
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				justifyContent: 'center',
				flex: 1,
			}}>
			<View style={{ borderRadius: 10, overflow: 'hidden' }}>
				<QR
					value={profile?.id}
					size={(width * 2) / 3}
					logo={{ uri: profile?.image || '' }}
					logoBackgroundColor={profile?.image ? '#fff' : 'transparent'}
					logoSize={70}
					logoBorderRadius={999}
					logoMargin={10}
					quietZone={20}
				/>
			</View>
			<Text style={{ marginTop: 16, fontSize: 15, lineHeight: 20 }}>
				Scan to add {profile?.name}
			</Text>
		</View>
	);
};

const DetailsView = ({ profile }: { profile?: BasicProfile }) => {
	const excludedKeys = ['name', 'image', 'id', 'about'];
	const entries = profile
		? Object.entries(profile).filter(
				(entry) => !excludedKeys.includes(entry[0]),
		  )
		: [];

	return (
		<View
			style={{
				display: 'flex',
				flex: 1,
				justifyContent: 'center',
				alignItems: 'center',
			}}>
			{entries.length === 0 ? (
				<Text style={{ opacity: 0.5 }}>No details added yet...</Text>
			) : (
				entries.map(([key, value]) => (
					<View>
						<Text>{key}</Text>
						<Text>{value}</Text>
					</View>
				))
			)}
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
	title: {
		fontSize: 18,
		marginBottom: 20,
	},
	slashtag: {
		fontSize: 10,
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
	},
	bottomHeader: {
		display: 'flex',
		flexDirection: 'row',
		justifyContent: 'space-between',
	},
});

export default Profile;
