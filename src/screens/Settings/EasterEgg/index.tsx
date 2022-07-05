import React, { memo, ReactElement } from 'react';
import { View, Image, StyleSheet, Share } from 'react-native';

import Button from '../../../components/Button';
import GlowingBackground from '../../../components/GlowingBackground';
import useColors from '../../../hooks/colors';
import { Display } from '../../../styles/components';
import SettingsView from './../SettingsView';

const EasterEgg = (): ReactElement => {
	const { brand } = useColors();

	const onShare = async (): Promise<void> => {
		await Share.share({
			title: 'Bitkit',
			message: 'TODO link to bitkit wallet goes here',
		});
	};
	return (
		<GlowingBackground bottomRight={brand}>
			<SettingsView title={'Orange Pilled'} showBackNavigation={true} />
			<View style={styles.alignCenter}>
				<Image
					source={require('../../../assets/illustrations/orange-pill.png')}
				/>
			</View>
			<View style={styles.intro}>
				<Display color="white" style={styles.title}>
					Who will you
				</Display>
				<Display color="brand" style={styles.subtitle}>
					Orange Pill?
				</Display>
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
		fontWeight: '700',
		fontSize: 48,
		lineHeight: 48,
		marginTop: 48,
	},
	subtitle: {
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
		width: 343,
		height: 56,
		fontWeight: 600,
	},
});

export default memo(EasterEgg);
