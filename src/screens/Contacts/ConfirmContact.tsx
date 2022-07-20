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
import Store from '../../store/types';
import { useSlashtag } from '../../hooks/slashtags';
import SafeAreaInsets from '../../components/SafeAreaInsets';
import ProfileCard from '../../components/ProfileCard';
import QR from 'react-native-qrcode-svg';
import { BasicProfile } from '../../store/types/slashtags';
import { TouchableOpacity } from 'react-native-gesture-handler';
import ProfileDetails from '../../components/ProfileLinks';

export const ConfirmContact = ({ navigation, route }): JSX.Element => {
	const id = route.params.id;
	const contact = useSlashtag({ url: id });

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
				<ProfileCard id={contact?.id} profile={contact} variant={'editable'} />
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

export default ConfirmContact;
