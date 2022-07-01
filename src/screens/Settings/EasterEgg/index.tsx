import React, { memo, ReactElement } from 'react';
import { View, Image, StyleSheet, Share } from 'react-native';

import Button from '../../../components/Button';
import GlowingBackground from '../../../components/GlowingBackground';
import { Display } from '../../../styles/components';
import SettingsView from './../SettingsView';

const EasterEgg = (): ReactElement => {
	const onShare = async (): Promise<void> => {
		await Share.share({
			title: 'Bitkit',
			message: 'TODO link to bitkit wallet goes here',
		});
	};
	return (
		<GlowingBackground bottomRight="#FF6600">
			<SettingsView title={'Orange Pilled'} showBackNavigation={true} />
			<View style={styles.alignCenter}>
				<Image
					source={require('../../../assets/illustrations/orange-pill.png')}
				/>
			</View>
			<View style={styles.intro}>
				<Display style={styles.title}>Who will you</Display>
				<Display style={styles.subtitle}>Orange Pill?</Display>
			</View>
			<View style={styles.alignCenter}>
				<Button
					style={styles.button}
					onPress={onShare}
					text={'Share Bitkit with a friend'}
				/>
			</View>
		</GlowingBackground>
	);
};

const styles = StyleSheet.create({
	intro: {
		alignItems: 'center',
		padding: 0,
		gap: 8,
		display: 'flex',
		flexDirection: 'column',
		marginBottom: 40,
	},
	title: {
		fontStyle: 'normal',
		textAlign: 'left',
		fontWeight: '700',
		fontSize: 48,
		lineHeight: 48,
		color: '#fff',
		width: 281,
	},
	subtitle: {
		color: '#FF6600',
		textAlign: 'left',
		fontStyle: 'normal',
		fontWeight: '700',
		fontSize: 48,
		lineHeight: 48,
		width: 281,
	},
	alignCenter: {
		alignItems: 'center',
	},
	button: {
		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'center',
		alignItems: 'center',
		marginLeft: 16,
		marginRight: 16,
		marginBottom: 16,
		gap: 40,
		width: 343,
		height: 56,
		fontWeight: 600,
		background: 'rgba(255, 255, 255, 0.08)',
		boxShadow: '0px 25px 50px rgba(0, 0, 0, 0.25)',
		backdropFilter: 'blur(10px)',
		borderRadius: 64,
	},
});

export default memo(EasterEgg);
