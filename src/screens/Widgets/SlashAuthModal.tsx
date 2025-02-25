import React, {
	memo,
	ReactElement,
	useCallback,
	useMemo,
	useState,
} from 'react';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Client } from '@synonymdev/slashtags-auth';
import { SlashURL } from '@synonymdev/slashtags-sdk';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

import BottomSheetWrapper from '../../components/BottomSheetWrapper';
import Button from '../../components/Button';
import BottomSheetNavigationHeader from '../../components/BottomSheetNavigationHeader';
import SafeAreaInset from '../../components/SafeAreaInset';
import { closeBottomSheet } from '../../store/actions/ui';
import { useBottomSheetBackPress } from '../../hooks/bottomSheet';
import { useProfile, useSelectedSlashtag } from '../../hooks/slashtags';
import { ContactItem } from '../../components/ContactsList';
import { IContactRecord } from '../../store/types/slashtags';
import ProfileImage from '../../components/ProfileImage';
import { Title, Text01S } from '../../styles/text';
import { Checkmark } from '../../styles/icons';
import {
	showErrorNotification,
	showSuccessNotification,
} from '../../utils/notifications';
import { ellipsis } from '../../utils/helpers';
import { setAuthWidget } from '../../store/actions/widgets';
import Divider from '../../components/Divider';
import { useSnapPoints } from '../../hooks/bottomSheet';
import { rootNavigation } from '../../navigation/root/RootNavigator';
import HourglassSpinner from '../../components/HourglassSpinner';
import GlowImage from '../../components/GlowImage';
import { useAppSelector } from '../../hooks/redux';
import {
	viewControllerIsOpenSelector,
	viewControllerSelector,
} from '../../store/reselect/ui';

const imageSrc = require('../../assets/illustrations/keyring.png');

export type BackupNavigationProp =
	NativeStackNavigationProp<BackupStackParamList>;

export type BackupStackParamList = {
	ShowMnemonic: undefined;
	ConfirmMnemonic: undefined;
	Result: undefined;
	Metadata: undefined;
};

const Key = ({
	contact,
	active,
	onPress,
}: {
	contact: IContactRecord;
	active: boolean;
	onPress: () => void;
}): ReactElement => {
	return (
		<TouchableOpacity onPress={onPress} activeOpacity={0.9}>
			<View style={keyStyles.row}>
				<ContactItem contact={contact} size="small" onPress={onPress} />
				{active && <Checkmark color="brand" height={32} width={32} />}
			</View>
			<Divider />
		</TouchableOpacity>
	);
};

const _SlashAuthModal = (): ReactElement => {
	const { t } = useTranslation('slashtags');
	const [anonymous, setAnonymous] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	const view = useAppSelector((state) => {
		return viewControllerSelector(state, 'slashauthModal');
	});
	const _url = view.url as string;

	const parsed = useMemo(() => SlashURL.parse(_url), [_url]);
	const url = useMemo(() => SlashURL.format(parsed.key), [parsed.key]);

	const { slashtag } = useSelectedSlashtag();
	const { profile } = useProfile(url, { resolve: true });

	const server: IContactRecord = useMemo(() => {
		return { url, ...profile, name: profile.name || '' };
	}, [url, profile]);

	const rootContact: IContactRecord = useMemo(() => {
		return { url: slashtag.url, name: t('your_name_capital') };
	}, [slashtag, t]);

	// const sdk = useSlashtagsSDK();

	// const anonymousSlashtag = useMemo(() => {
	// TODO(slashtags): update when slashtag.sub API is added
	// return sdk.slashtag(SlashURL.encode(parsed.key));
	// }, [sdk, parsed.key]);

	// const anonymousContact: IContactRecord = useMemo(() => {
	// return { url: anonymousSlashtag.url, name: 'Anonymous' };
	// }, [anonymousSlashtag]);

	const serviceName = useMemo(() => {
		return server.name || ellipsis(server.url, 25);
	}, [server]);

	const text = useMemo(() => {
		return t(isLoading ? 'signin_to_loading' : 'signin_to', { serviceName });
	}, [serviceName, isLoading, t]);

	const onCancel = useCallback((): void => {
		closeBottomSheet('slashauthModal');
	}, []);

	const onContinue = useCallback(async (): Promise<void> => {
		setIsLoading(true);

		const client = new Client(slashtag);
		const response = await client.authz(_url).catch((e: Error) => {
			if (e.message === 'channel closed') {
				closeBottomSheet('slashauthModal');
				showErrorNotification({
					title: t('signin_to_error_header'),
					message: t('signin_to_error_text'),
				});
			}
		});

		if (response?.status === 'ok') {
			showSuccessNotification({
				title: t('signin_to_success_header'),
				message: server.name
					? t('signin_to_success_text_name', { name: server.name })
					: t('signin_to_success_text_noname'),
			});

			setAuthWidget(url, { magiclink: true });
			rootNavigation.navigate('Wallet');
		} else {
			showErrorNotification({
				title: t('signin_to_error_header'),
				message: response?.message || '',
			});
		}

		setIsLoading(false);
		closeBottomSheet('slashauthModal');
	}, [_url, server.name, slashtag, url, t]);

	return (
		<View style={styles.container}>
			<BottomSheetNavigationHeader
				title={t(isLoading ? 'signin_title_loading' : 'signin_title')}
				displayBackButton={false}
			/>
			<View style={styles.header}>
				<ProfileImage
					style={styles.headerImage}
					url={server.url}
					image={server?.image}
					size={32}
				/>
				<Title>{serviceName}</Title>
			</View>
			<Text01S color="gray1" style={styles.text}>
				{text}
			</Text01S>
			<Key
				contact={rootContact}
				active={!anonymous}
				onPress={(): void => setAnonymous(false)}
			/>
			{/** <Key
				contact={anonymousContact}
				active={anonymous}
				onPress={(): void => setAnonymous(true)}
			/>*/}

			{isLoading && <HourglassSpinner />}
			{!isLoading && <GlowImage image={imageSrc} imageSize={240} />}

			<View style={styles.buttonContainer}>
				<Button
					style={styles.button}
					size="large"
					text={t('cancel')}
					variant="secondary"
					onPress={onCancel}
				/>
				{!isLoading && (
					<>
						<View style={styles.divider} />
						<Button
							style={styles.button}
							size="large"
							text={t('signin_title')}
							disabled={isLoading}
							onPress={onContinue}
						/>
					</>
				)}
			</View>
			<SafeAreaInset type="bottom" minPadding={16} />
		</View>
	);
};

const SlashAuthModal = (): ReactElement => {
	const snapPoints = useSnapPoints('large');
	useBottomSheetBackPress('slashauthModal');

	const isOpen = useSelector((state) =>
		viewControllerIsOpenSelector(state, 'slashauthModal'),
	);

	return (
		<BottomSheetWrapper view="slashauthModal" snapPoints={snapPoints}>
			{isOpen ? <_SlashAuthModal /> : <View />}
		</BottomSheetWrapper>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		paddingHorizontal: 16,
	},
	header: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	headerImage: {
		marginRight: 16,
		borderRadius: 8,
	},
	text: {
		marginTop: 32,
		marginBottom: 32,
	},
	buttonContainer: {
		flexDirection: 'row',
		justifyContent: 'center',
		marginTop: 'auto',
	},
	button: {
		flex: 1,
	},
	divider: {
		width: 16,
	},
});

const keyStyles = StyleSheet.create({
	row: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
});

export default memo(SlashAuthModal);
