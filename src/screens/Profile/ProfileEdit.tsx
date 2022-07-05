import React, { useState, useMemo } from 'react';
import {
	CameraIcon,
	PlusIcon,
	ScrollView,
	Subtitle,
	Text,
	View,
} from '../../styles/components';
import NavigationHeader from '../../components/NavigationHeader';
import Button from '../../components/Button';
import { useSlashtags } from '../../hooks/slashtags';
import SafeAreaInsets from '../../components/SafeAreaInsets';
import { BasicProfile } from '../../store/types/slashtags';
import { StyleSheet } from 'react-native';
import { setVisitedProfile } from '../../store/actions/slashtags';
import ProfileImage from '../../components/ProfileImage';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { launchImageLibrary } from 'react-native-image-picker';
import Input from '../../components/LabeledInput';
import ProfileDetails from '../../components/ProfileDetails';
import BottomSheetWrapper from '../../components/BottomSheetWrapper';
import { toggleView } from '../../store/actions/user';

export const ProfileEdit = ({
	navigation,
}: {
	navigation: any;
}): JSX.Element => {
	const [fields, setFields] = useState<BasicProfile | null>(null);
	const [addDataForm, setAddDataForm] = useState({ key: '', value: '' });

	const { slashtag, profile: savedProfile } = useSlashtags();

	const setField = (key: string, value: string | undefined): void =>
		setFields({ ...fields, [key]: value });

	const [image, setImage] = useState<string | null>(null);

	const profile: BasicProfile = useMemo(() => {
		return { ...savedProfile, ...fields, ...(image ? { image } : {}) };
	}, [savedProfile, fields, image]);

	return (
		<View style={styles.container}>
			<SafeAreaInsets type={'top'} />
			<NavigationHeader title="Edit profile" />
			<View style={styles.content}>
				<ScrollView>
					<View style={styles.topRow}>
						<Text style={styles.note}>
							Please note that all your profile information will be publicly
							available.
						</Text>
						<TouchableOpacity
							activeOpacity={0.8}
							style={styles.editImageButton}
							onPress={async (): Promise<void> => {
								const result = await launchImageLibrary({
									mediaType: 'photo',
									includeBase64: true,
									quality: 0.1,
								});
								const base64 = result.assets?.[0].base64;
								const type = result.assets?.[0].type;
								base64 && setImage(`data:${type};base64,` + base64);
							}}>
							<CameraIcon style={styles.cameraIcon} />
							<ProfileImage
								size={96}
								profile={profile}
								style={styles.profileImage}
							/>
						</TouchableOpacity>
					</View>
					<Input
						label="Profile name"
						value={profile?.name}
						onChange={(val): void => setField('name', val)}
					/>
					<Input
						label="Bio"
						value={profile?.bio}
						multiline={true}
						onChange={(val): void => setField('', val)}
					/>
					<ProfileDetails profile={profile} setField={setField} />
					<Button
						text="Add data"
						style={styles.addDataButton}
						onPress={(): void => {
							toggleView({
								view: 'profileAddDataForm',
								data: { isOpen: true },
							});
						}}
						icon={
							<PlusIcon color="brand" width={16} style={styles.addDataButton} />
						}
					/>
				</ScrollView>
				<Button
					style={styles.saveButton}
					text="Save profile"
					size="large"
					onPress={async (): Promise<void> => {
						if (JSON.stringify(profile) !== JSON.stringify(savedProfile)) {
							await slashtag?.setProfile(profile);
						}
						setVisitedProfile(true);
						navigation.goBack();
					}}
				/>
			</View>
			<BottomSheetWrapper
				headerColor="onSurface"
				backdrop={true}
				view="profileAddDataForm"
				snapPoints={[400]}>
				<View style={styles.editDataModal}>
					<Subtitle style={styles.addDataTitle}>Add data</Subtitle>
					<View style={styles.editDataContent}>
						<Input
							label="Label"
							value={addDataForm.key}
							onChange={(key: string): void => {
								setAddDataForm({ ...addDataForm, key });
							}}
						/>
						<Input
							label="DATA (URL OR TEXT)"
							value={addDataForm.value}
							onChange={(value: string): void => {
								setAddDataForm({ ...addDataForm, value });
							}}
						/>
						<Button
							text="Save"
							size="large"
							style={styles.addDataSave}
							disabled={!(addDataForm.key?.length > 0)}
							onPress={(): void => {
								const { key, value } = addDataForm;
								if (key.length > 0) {
									setField(key, value);
									setAddDataForm({ key: '', value: '' });
								}
								toggleView({
									view: 'profileAddDataForm',
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
	editImageButton: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
	},
	cameraIcon: {
		position: 'absolute',
		zIndex: 99999,
	},
	profileImage: {
		opacity: 0.6,
	},
	addDataButton: {
		height: 40,
	},
	editDataModal: {
		flex: 1,
		backgroundColor: 'transparent',
	},
	addDataTitle: {
		textAlign: 'center',
		marginBottom: 16,
	},
	editDataContent: {
		display: 'flex',
		padding: 16,
		backgroundColor: 'transparent',
	},
	addDataSave: {
		marginTop: 8,
	},
	saveButton: {
		marginTop: 32,
	},
});

export default ProfileEdit;
