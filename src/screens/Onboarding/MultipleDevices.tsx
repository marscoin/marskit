import React, { ReactElement } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { Trans, useTranslation } from 'react-i18next';

import { Display, Text01S } from '../../styles/text';
import SafeAreaInset from '../../components/SafeAreaInset';
import GlowingBackground from '../../components/GlowingBackground';
import NavigationHeader from '../../components/NavigationHeader';
import Button from '../../components/Button';
import type { OnboardingStackScreenProps } from '../../navigation/types';

const imageSrc = require('../../assets/illustrations/phone.png');

const MultipleDevices = ({
	navigation,
}: OnboardingStackScreenProps<'MultipleDevices'>): ReactElement => {
	const { t } = useTranslation('onboarding');

	return (
		<GlowingBackground topLeft="yellow">
			<View style={styles.slide}>
				<SafeAreaInset type="top" />
				<NavigationHeader />
				<View style={styles.imageContainer}>
					<Image style={styles.image} source={imageSrc} />
				</View>
				<View style={styles.textContent}>
					<Display>
						<Trans
							t={t}
							i18nKey="multiple_header"
							components={{
								yellow: <Display color="yellow" />,
							}}
						/>
					</Display>
					<Text01S color="gray1" style={styles.text}>
						{t('multiple_text')}
					</Text01S>
				</View>

				<View style={styles.buttonContainer}>
					<Button
						text={t('understood')}
						size="large"
						style={[styles.button, styles.quickButton]}
						onPress={(): void => {
							navigation.navigate('RestoreFromSeed');
						}}
						testID="MultipleButton"
					/>
				</View>
				<SafeAreaInset type="bottom" minPadding={16} />
			</View>
		</GlowingBackground>
	);
};

const styles = StyleSheet.create({
	slide: {
		flex: 1,
		justifyContent: 'space-between',
		alignItems: 'stretch',
	},
	imageContainer: {
		flex: 4,
		alignItems: 'center',
		paddingVertical: 50,
		justifyContent: 'flex-end',
		width: '100%',
	},
	image: {
		flex: 1,
		resizeMode: 'contain',
	},
	textContent: {
		flex: 4,
		paddingHorizontal: 32,
	},
	text: {
		marginTop: 8,
	},
	buttonContainer: {
		flexDirection: 'row',
		justifyContent: 'center',
		marginTop: 'auto',
		marginHorizontal: 32,
	},
	button: {
		flex: 1,
	},
	quickButton: {
		marginRight: 6,
	},
});

export default MultipleDevices;
