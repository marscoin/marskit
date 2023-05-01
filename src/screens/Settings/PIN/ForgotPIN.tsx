import React, { memo, ReactElement } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Text01S } from '../../../styles/text';
import BottomSheetWrapper from '../../../components/BottomSheetWrapper';
import BottomSheetNavigationHeader from '../../../components/BottomSheetNavigationHeader';
import SafeAreaInset from '../../../components/SafeAreaInset';
import GlowImage from '../../../components/GlowImage';
import Button from '../../../components/Button';
import { closeBottomSheet } from '../../../store/actions/ui';
import { wipeApp } from '../../../store/actions/settings';
import {
	useBottomSheetBackPress,
	useSnapPoints,
} from '../../../hooks/bottomSheet';

const imageSrc = require('../../../assets/illustrations/restore.png');

const ForgotPIN = (): ReactElement => {
	const { t } = useTranslation('security');
	const snapPoints = useSnapPoints('large');

	useBottomSheetBackPress('forgotPIN');

	const handlePress = (): void => {
		wipeApp();
		closeBottomSheet('forgotPIN');
	};

	return (
		<BottomSheetWrapper
			view="forgotPIN"
			snapPoints={snapPoints}
			backdrop={true}>
			<View style={styles.container}>
				<BottomSheetNavigationHeader
					title={t('pin_forgot_title')}
					displayBackButton={false}
				/>
				<Text01S color="white5">{t('pin_forgot_text')}</Text01S>

				<GlowImage image={imageSrc} imageSize={192} />

				<View style={styles.buttonContainer}>
					<Button
						style={styles.button}
						size="large"
						text={t('pin_forgot_reset')}
						onPress={handlePress}
					/>
				</View>
				<SafeAreaInset type="bottom" minPadding={16} />
			</View>
		</BottomSheetWrapper>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: 'center',
		paddingHorizontal: 32,
	},
	buttonContainer: {
		marginTop: 'auto',
		flexDirection: 'row',
		justifyContent: 'center',
	},
	button: {
		flex: 1,
	},
});

export default memo(ForgotPIN);
