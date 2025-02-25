import React, { memo, ReactElement, useState } from 'react';
import { StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';

import { View } from '../../../styles/components';
import { Text01S } from '../../../styles/text';
import NavigationHeader from '../../../components/NavigationHeader';
import SafeAreaInset from '../../../components/SafeAreaInset';
import Dialog from '../../../components/Dialog';
import GlowImage from '../../../components/GlowImage';
import Button from '../../../components/Button';
import { wipeApp } from '../../../store/actions/settings';
import { showBottomSheet } from '../../../store/actions/ui';
import type { SettingsScreenProps } from '../../../navigation/types';

const imageSrc = require('../../../assets/illustrations/restore.png');

const ResetAndRestore = ({
	navigation,
}: SettingsScreenProps<'ResetAndRestore'>): ReactElement => {
	const { t } = useTranslation('security');
	const [showDialog, setShowDialog] = useState(false);

	return (
		<View style={styles.root}>
			<SafeAreaInset type="top" />
			<NavigationHeader
				title={t('reset_title')}
				onClosePress={(): void => navigation.navigate('Wallet')}
			/>
			<View style={styles.container}>
				<Text01S color="gray1">{t('reset_text')}</Text01S>

				<GlowImage image={imageSrc} imageSize={230} />

				<View style={styles.buttonContainer}>
					<Button
						size="large"
						variant="secondary"
						style={styles.button}
						text={t('reset_button_backup')}
						onPress={(): void => {
							showBottomSheet('backupNavigation');
						}}
					/>
					<View style={styles.divider} />
					<Button
						size="large"
						style={styles.button}
						text={t('reset_button_reset')}
						onPress={(): void => setShowDialog(true)}
					/>
				</View>
				<SafeAreaInset type="bottom" minPadding={16} />
			</View>

			<Dialog
				visible={showDialog}
				title={t('reset_dialog_title')}
				description={t('reset_dialog_desc')}
				onCancel={(): void => setShowDialog(false)}
				onConfirm={async (): Promise<void> => {
					await wipeApp();
					setShowDialog(false);
				}}
			/>
		</View>
	);
};

const styles = StyleSheet.create({
	root: {
		flex: 1,
	},
	container: {
		flex: 1,
		paddingHorizontal: 16,
	},
	buttonContainer: {
		marginTop: 'auto',
		flexDirection: 'row',
		justifyContent: 'center',
	},
	button: {
		flex: 1,
	},
	divider: {
		width: 16,
	},
});

export default memo(ResetAndRestore);
