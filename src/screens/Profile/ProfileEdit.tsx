import React, { useState, useMemo, useEffect, useCallback, memo } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

import { ScrollView, View as ThemedView } from '../../styles/components';
import { Text02S } from '../../styles/text';
import { PlusIcon } from '../../styles/icons';
import NavigationHeader from '../../components/NavigationHeader';
import Button from '../../components/Button';
import SafeAreaInsets from '../../components/SafeAreaInsets';
import ProfileCard from '../../components/ProfileCard';
import ProfileLinks from '../../components/ProfileLinks';
import Divider from '../../components/Divider';
import useKeyboard from '../../hooks/keyboard';
import { useProfile, useSelectedSlashtag } from '../../hooks/slashtags';
import {
	setLinks,
	setOnboardingProfileStep,
} from '../../store/actions/slashtags';
import { removeTodo } from '../../store/actions/todos';
import { BasicProfile } from '../../store/types/slashtags';
import { slashtagsLinksSelector } from '../../store/reselect/slashtags';
import { onboardingProfileStepSelector } from '../../store/reselect/slashtags';
import { arraysMatch } from '../../utils/helpers';
import { saveProfile } from '../../utils/slashtags';
import type { RootStackScreenProps } from '../../navigation/types';

export const ProfileEdit = ({
	navigation,
}: RootStackScreenProps<'Profile' | 'ProfileEdit'>): JSX.Element => {
	const { t } = useTranslation('slashtags');
	const { keyboardShown } = useKeyboard();
	const [hasEdited, setHasEdited] = useState(false);
	const [fields, setFields] = useState<Omit<BasicProfile, 'links'>>({});
	const links = useSelector(slashtagsLinksSelector);
	const onboardingStep = useSelector(onboardingProfileStepSelector);

	const { url, slashtag } = useSelectedSlashtag();
	const { profile: savedProfile } = useProfile(url);

	const onboardedProfile = onboardingStep === 'Done';

	const buttonContainerStyles = useMemo(
		() => ({
			...styles.buttonContainer,
			// extra padding needed because of KeyboardAvoidingView
			paddingBottom: keyboardShown ? (Platform.OS === 'ios' ? 16 : 40) : 0,
		}),
		[keyboardShown],
	);

	useEffect(() => {
		const savedLinks = savedProfile?.links || [];
		// add id field before saving to redux
		const localLinks = savedLinks.map((link) => ({
			...link,
			id: `${link.title}:${link.url}`,
		}));
		setLinks(localLinks);
	}, [savedProfile?.links]);

	// show save button if links have changed
	useEffect(() => {
		const savedLinks = savedProfile?.links || [];
		if (arraysMatch(links, savedLinks)) {
			setHasEdited(false);
		} else {
			setHasEdited(true);
		}
	}, [links, savedProfile?.links]);

	const setField = useCallback(
		(key: string, value: string): void => {
			setHasEdited(true);
			setFields({ ...fields, [key]: value });
		},
		[fields],
	);

	const profile: BasicProfile = useMemo(() => {
		return {
			...savedProfile,
			...fields,
			// remove id field before saving to remote
			links: links.map(({ id: _id, ...rest }) => rest),
		};
	}, [savedProfile, fields, links]);

	const save = async (): Promise<void> => {
		await saveProfile(slashtag, profile);
		if (!onboardedProfile) {
			setOnboardingProfileStep('OfflinePayments');
			removeTodo('slashtagsProfile');
		} else {
			navigation.navigate('Profile');
		}
	};

	const isValid = useCallback(() => {
		const isAnyLinkEmpty = links.some((link) => link.url === '');

		if (!profile.name || profile.name.replace(/\s/g, '').length === 0) {
			return false;
		}

		if (isAnyLinkEmpty) {
			return false;
		}

		return true;
	}, [profile, links]);

	return (
		<ThemedView style={styles.container}>
			<SafeAreaInsets type="top" />
			<NavigationHeader
				style={styles.header}
				title={t(onboardedProfile ? 'profile' : 'profile_create')}
				onClosePress={(): void => {
					navigation.navigate(onboardedProfile ? 'Profile' : 'Wallet');
				}}
			/>
			<KeyboardAvoidingView behavior="padding" style={styles.content}>
				<ScrollView style={styles.scroll}>
					<ProfileCard
						url={url}
						editable={true}
						resolving={false}
						profile={profile}
						onChange={setField}
					/>
					<Divider />
					<ProfileLinks links={links} editable={true} />
					<Button
						text={t('profile_add_link')}
						style={styles.addLinkButton}
						onPress={(): void => {
							navigation.navigate('ProfileAddLink');
						}}
						icon={
							<PlusIcon color="brand" width={16} style={styles.addLinkButton} />
						}
					/>
					<Divider />
					<Text02S color="gray1">{t('profile_public_warn')}</Text02S>

					{(!onboardedProfile || hasEdited) && (
						<View style={buttonContainerStyles}>
							<Button
								style={styles.button}
								text={t(onboardedProfile ? 'profile_save' : 'continue')}
								size="large"
								disabled={!isValid()}
								onPress={save}
							/>
						</View>
					)}
				</ScrollView>
			</KeyboardAvoidingView>
			<SafeAreaInsets type="bottom" />
		</ThemedView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	scroll: {
		flex: 1,
	},
	header: {
		paddingBottom: 32,
	},
	content: {
		flexGrow: 1,
		paddingHorizontal: 16,
		paddingBottom: 16,
	},
	addLinkButton: {
		alignSelf: 'flex-start',
	},
	buttonContainer: {
		flexDirection: 'row',
		justifyContent: 'center',
		marginTop: 'auto',
	},
	button: {
		flex: 1,
		margin: 16,
	},
});

export default memo(ProfileEdit);
