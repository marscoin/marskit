import React, { useState } from 'react';
import { Text, View } from '../../styles/components';
import NavigationHeader from '../../components/NavigationHeader';
import { Image, ImageSourcePropType } from 'react-native';
import Button from '../../components/Button';
import { Title } from '../../styles/components';
import GlowingBackground from '../../components/GlowingBackground';
import SafeAreaInsets from '../../components/SafeAreaInsets';
import { StyleSheet } from 'react-native';
import { setOnboardingProfileStep } from '../../store/actions/slashtags';
import { ISlashtags, SlashPayConfig } from '../../store/types/slashtags';
import SwitchRow from '../../components/SwitchRow';
import { getReceiveAddress } from '../../utils/wallet';
import { useSelector } from 'react-redux';
import Store from '../../store/types';
import { useSlashtagsSDK } from '../../components/SlashtagsProvider';
import { getSelectedSlashtag } from '../../utils/slashtags';

export const ProfileIntro = ({ navigation }): JSX.Element => {
	return (
		<Layout
			navigation={navigation}
			backButton={false}
			illustration={require('../../assets/illustrations/crown.png')}
			illustrationStyle={styles.crown}
			title="Own your"
			highlighted="Social Profile"
			text="Use Slashtags to control your public profile and links, so your
contacts can reach you or pay you anytime."
			nextStep="InitialEdit"
		/>
	);
};

export const PaymentsFromContacts = ({ navigation }): JSX.Element => {
	return (
		<Layout
			navigation={navigation}
			backButton={true}
			illustration={require('../../assets/illustrations/coin-stack-2.png')}
			illustrationStyle={styles.crown}
			title="Payments"
			subtitle="from "
			highlighted="Contacts"
			text="Contacts can pay you instantly viaLightning whenever you are online."
			nextStep="OfflinePayments"
		/>
	);
};

export const OfflinePayments = ({ navigation }): JSX.Element => {
	const [enableOfflinePayment, setEnableOfflinePayment] = useState(true);

	const selectedWallet = useSelector(
		(state: Store) => state.wallet.selectedWallet,
	);

	const sdk = useSlashtagsSDK();

	const savePaymentConfig = (): void => {
		const payConfig: SlashPayConfig = {};
		if (enableOfflinePayment) {
			const response = getReceiveAddress({ selectedWallet });
			if (response.isOk()) {
				payConfig.p2wpkh = response.value;
			}
		}
		const slashtag = getSelectedSlashtag(sdk);
		slashtag?.publicDrive.put(
			'/slashprofile',
			Buffer.from(JSON.stringify(payConfig)),
		);
	};

	return (
		<Layout
			navigation={navigation}
			backButton={true}
			illustration={require('../../assets/illustrations/switch.png')}
			illustrationStyle={styles.swtich}
			title="Offline"
			highlighted="Payments."
			text="Bitkit can also create a fixed Bitcoin address for you, so you’re able to receive payments even when you are offline."
			nextStep="Done"
			buttonText="Save profile"
			onNext={savePaymentConfig}>
			<View>
				<View style={styles.enableOfflineRow}>
					<SwitchRow
						isEnabled={enableOfflinePayment}
						onPress={(): void =>
							setEnableOfflinePayment(!enableOfflinePayment)
						}>
						<Text style={styles.enableOfflineLabel}>
							Enable offline payments
						</Text>
					</SwitchRow>
				</View>
			</View>
		</Layout>
	);
};

const Layout = ({
	navigation,
	backButton = false,
	illustration,
	illustrationStyle,
	title,
	subtitle,
	text,
	highlighted,
	nextStep,
	buttonText = 'Continue',
	children,
	onNext,
}: {
	navigation;
	backButton: boolean;
	illustration: ImageSourcePropType;
	illustrationStyle;
	title: string;
	subtitle?: string;
	text: string;
	highlighted: string;
	nextStep: ISlashtags['onboardingProfileStep'];
	buttonText?: string;
	children?;
	onNext?;
}): JSX.Element => {
	return (
		<GlowingBackground topLeft="brand">
			<SafeAreaInsets type={'top'} />
			<NavigationHeader
				title="Profile"
				displayBackButton={backButton}
				onClosePress={(): void => {
					navigation.navigate('Tabs');
				}}
			/>
			<View style={styles.content}>
				<Image
					source={illustration}
					style={{ ...styles.illustration, ...illustrationStyle }}
				/>
				<View style={styles.middleContainer}>
					<Title style={styles.headline}>{title}</Title>
					<Title style={styles.headline}>
						{subtitle}
						<Title color="brand" style={styles.headline}>
							{highlighted}
						</Title>
					</Title>
					<Text color="gray1" style={styles.introText}>
						{text}
					</Text>
					{children}
				</View>
				<Button
					textStyle={styles.button}
					text={buttonText}
					size="large"
					onPress={(): void => {
						onNext?.();
						setOnboardingProfileStep(nextStep);
					}}
				/>
			</View>
		</GlowingBackground>
	);
};

const styles = StyleSheet.create({
	content: {
		flex: 1,
		justifyContent: 'space-between',
		margin: 20,
		marginTop: 0,
		backgroundColor: 'transparent',
	},
	illustration: {
		alignSelf: 'center',
	},
	crown: {
		width: 332,
		height: 332,
	},
	swtich: {
		width: 190,
		height: 332,
	},
	headline: {
		fontSize: 48,
		lineHeight: 48,
	},
	introText: {
		marginTop: 8,
		fontSize: 17,
		lineHeight: 22,
	},
	button: {
		fontWeight: '800',
	},
	middleContainer: { flex: 1 },
	enableOfflineRow: {
		marginTop: 25,
	},
	enableOfflineLabel: {
		backgroundColor: 'transparent',
		fontSize: 17,
		lineHeight: 22,
	},
});
