import React, { useState, useMemo, useEffect } from 'react';
import {
	PlusIcon,
	ScrollView,
	Subtitle,
	Text,
	View,
} from '../../styles/components';
import NavigationHeader from '../../components/NavigationHeader';
import Button from '../../components/Button';
import { useSlashtagProfile } from '../../hooks/slashtags';
import SafeAreaInsets from '../../components/SafeAreaInsets';
import { BasicProfile } from '../../store/types/slashtags';
import { StyleSheet } from 'react-native';
import Input from '../../components/LabeledInput';
import BottomSheetWrapper from '../../components/BottomSheetWrapper';
import { toggleView } from '../../store/actions/user';
import ProfileCard from '../../components/ProfileCard';
import ProfileLinks from '../../components/ProfileLinks';
import { useSelector } from 'react-redux';
import Store from '../../store/types';

export const ProfileEdit = ({ navigation, route }): JSX.Element => {
	const [fields, setFields] = useState<Omit<BasicProfile, 'links'>>({});
	const [addLinkForm, setAddLinkForm] = useState({ label: '', url: '' });
	const [links, setLinks] = useState<object>({});

	const onboardedProfile = useSelector(
		(state: Store) => state.slashtags.onboardedProfile,
	);

	const [savedProfile, setProfile] = useSlashtagProfile({
		url: route.params?.id,
	});

	useEffect(() => {
		const savedLinks = savedProfile.links || [];
		const entries = savedLinks?.map((l) => [l.title, l]);
		// @ts-ignore
		setLinks(Object.fromEntries(entries));
	}, [savedProfile]);

	const setField = (key: string, value: string | undefined): void =>
		setFields({ ...fields, [key]: value });

	const setLink = (title: string, url: string | undefined): void =>
		setLinks({ ...links, [title]: { title, url } });

	const profile: BasicProfile = useMemo(() => {
		const merged = {
			...savedProfile,
			...fields,
			links: Object.values(links),
		};
		return merged;
	}, [savedProfile, fields, links]);

	async function save(): Promise<void> {
		if (JSON.stringify(profile) !== JSON.stringify(savedProfile)) {
			setProfile(profile);
		}

		navigation.navigate('Profile', { id: profile.id });
	}

	return (
		<View style={styles.container}>
			<SafeAreaInsets type={'top'} />
			<NavigationHeader
				title={onboardedProfile ? 'Edit Profile' : 'Create Profile'}
				onClosePress={(): void => {
					navigation.navigate('Profile');
				}}
			/>
			<View style={styles.content}>
				<ScrollView>
					<ProfileCard
						editable={true}
						id={profile?.id}
						profile={profile}
						onChange={setField}
					/>
					<View style={styles.topRow} />
					<ProfileLinks links={profile?.links} setLink={setLink} />
					<Button
						text="Add link"
						style={styles.addLinkButton}
						onPress={(): void => {
							toggleView({
								view: 'profileAddLinkForm',
								data: { isOpen: true },
							});
						}}
						icon={
							<PlusIcon color="brand" width={16} style={styles.addLinkButton} />
						}
					/>
					<View style={styles.divider} />
					<Text style={styles.note}>
						Please note that all your profile information will be publicly
						available.
					</Text>
				</ScrollView>
				<Button
					style={styles.saveButton}
					text={onboardedProfile ? 'Save profile' : 'Continue'}
					size="large"
					disabled={(profile?.name?.length || '') === 0}
					onPress={save}
				/>
			</View>
			<BottomSheetWrapper
				headerColor="onSurface"
				backdrop={true}
				view="profileAddLinkForm"
				snapPoints={[400]}>
				<View style={styles.editDataModal}>
					<Subtitle style={styles.addLinkTitle}>Add link</Subtitle>
					<View style={styles.editLinkContent}>
						<Input
							bottomSheet={true}
							label="Label"
							value={addLinkForm.label}
							placeholder="For example ‘Website’"
							onChange={(label: string): void => {
								setAddLinkForm({ ...addLinkForm, label });
							}}
						/>
						<Input
							bottomSheet={true}
							label="Link OR TEXT"
							value={addLinkForm.url}
							placeholder="https://"
							onChange={(url: string): void => {
								setAddLinkForm({ ...addLinkForm, url });
							}}
						/>
						<Button
							text="Save"
							size="large"
							style={styles.addLinkSave}
							disabled={
								!(addLinkForm.label?.length > 0 && addLinkForm.url?.length > 0)
							}
							onPress={(): void => {
								const { label, url } = addLinkForm;
								if (label?.length > 0) {
									setLink(label, url);
									setAddLinkForm({ label: '', url: '' });
								}
								toggleView({
									view: 'profileAddLinkForm',
									data: { isOpen: false },
								});
							}}
						/>
					</View>
				</View>
			</BottomSheetWrapper>
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
	topRow: {
		display: 'flex',
		flexDirection: 'row',
		marginBottom: 32,
	},
	note: {
		marginRight: 16,
		fontSize: 17,
		lineHeight: 22,
		letterSpacing: -0.4,
		color: '#8E8E93',
		flex: 1,
		paddingRight: 20,
	},
	addLinkButton: {
		height: 40,
		maxWidth: 110,
	},
	editDataModal: {
		flex: 1,
		backgroundColor: 'transparent',
	},
	addLinkTitle: {
		textAlign: 'center',
		marginBottom: 16,
	},
	editLinkContent: {
		display: 'flex',
		padding: 16,
		backgroundColor: 'transparent',
	},
	addLinkSave: {
		marginTop: 8,
	},
	saveButton: {
		marginTop: 32,
	},

	divider: {
		height: 2,
		backgroundColor: 'rgba(255, 255, 255, 0.1)',

		marginTop: 16,
		marginBottom: 16,
	},
});

export default ProfileEdit;
