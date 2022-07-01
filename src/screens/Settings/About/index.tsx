import React, { memo, ReactElement, useMemo } from 'react';
import { Linking, Text, View, FlatList } from 'react-native';
import { StyleSheet } from 'react-native';
import { IListData } from '../../../components/List';
import SettingsView from '../SettingsView';
import GlowingBackground from '../../../components/GlowingBackground';

import BitkitLogo from '../../../assets/icons/social-bitkit.svg';
import SocialEmailLogo from '../../../assets/icons/social-email.svg';
import SocialGithubLogo from '../../../assets/icons/social-github.svg';
import SocialGlobeLogo from '../../../assets/icons/social-globe.svg';
import SocialMediumLogo from '../../../assets/icons/social-medium.svg';
import SocialTwitterLogo from '../../../assets/icons/social-twitter.svg';

const AboutSettings = ({ navigation }): ReactElement => {
	const SettingsListData: IListData[] = useMemo(
		() => [
			{
				data: [
					{
						title: 'Leave a review',
						type: 'button',
						onPress: (): void => navigation.navigate('TempSettings'),
						hide: false,
					},
					{
						title: 'Report a bug or contribute',
						type: 'button',
						onPress: (): Promise<void> =>
							Linking.openURL('https://github.com/synonymdev').then(),
						hide: false,
					},
					{
						title: 'Share Bitkit with a friend',
						type: 'button',
						onPress: (): void => navigation.navigate('TempSettings'),
						hide: false,
					},
					{
						title: 'Legal',
						type: 'button',
						onPress: (): void => navigation.navigate('TempSettings'),
						hide: false,
					},
					{
						title: 'Version',
						value: '1.0.0',
						type: 'textButton',
						onPress: (): void => {},
						hide: false,
					},
				],
			},
		],
		[navigation],
	);

	const headerComponent = (
		<SettingsView
			title={'About Bitkit'}
			listData={SettingsListData}
			showBackNavigation={true}>
			<Text style={styles.textIntro}>
				Bitkit puts you in control over your money, contacts, and web accounts.
				Your mobile toolkit for a new economy, based on Bitcoin.
			</Text>
			<Text style={styles.textIntro}>
				This{' '}
				<Text onPress={(): void => navigation.navigate('EasterEgg')}>
					Orange Pill
				</Text>{' '}
				was carefully crafted by: John, Reza, Paulo, Corey, Jason, Gr0kchain,
				Ar, Ivan, Instabot, Aldert, Sasha, Auwal, Miguel & Pavel from Synonym
				Software Ltd.
			</Text>
		</SettingsView>
	);

	const footerComponent = (
		<View style={styles.container}>
			<View style={styles.containerLogo}>
				<BitkitLogo />
			</View>
			<View style={styles.containerSocial}>
				<SocialEmailLogo
					onPress={(): void => {
						Linking.openURL('mailto:info@synonym.to?subject=General Inquiry');
					}}
					viewBox="0 0 24 24"
					height={24}
					width={24}
				/>
				<SocialGlobeLogo
					onPress={(): void => {
						Linking.openURL('https://synonym.to');
					}}
					viewBox="0 0 24 24"
					height={24}
					width={24}
				/>
				<SocialTwitterLogo
					onPress={(): void => {
						Linking.openURL('https://twitter.com/synonym_to');
					}}
					viewBox="0 0 24 24"
					height={24}
					width={24}
				/>
				<SocialMediumLogo
					onPress={(): void => {
						Linking.openURL('https://medium.com/synonym-to');
					}}
					viewBox="0 0 24 24"
					height={24}
					width={24}
				/>
				<SocialGithubLogo
					onPress={(): void => {
						Linking.openURL('https://github.com/synonymdev');
					}}
					viewBox="0 0 24 24"
					height={24}
					width={24}
				/>
			</View>
		</View>
	);

	return (
		<GlowingBackground bottomRight="#FF6600">
			<FlatList
				data={null}
				renderItem={null}
				ListHeaderComponent={headerComponent}
				ListFooterComponent={footerComponent}
			/>
		</GlowingBackground>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		flexDirection: 'column',
		alignItems: 'center',
		marginTop: 48,
	},
	containerSocial: {
		width: 300,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-evenly',
		marginBottom: 32,
	},
	containerLogo: {
		marginBottom: 42,
	},
	textIntro: {
		fontStyle: 'normal',
		fontWeight: '400',
		fontSize: 17,
		lineHeight: 22,
		display: 'flex',
		alignItems: 'center',
		letterSpacing: -0.4,
		color: '#8E8E93',
		paddingLeft: 16,
		paddingRight: 16,
		paddingBottom: 12,
		paddingTop: 12,
	},
});

export default memo(AboutSettings);
