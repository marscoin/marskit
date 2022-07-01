import React, { useState } from 'react';
import { CameraIcon, Text, TextInput, View } from '../../styles/components';
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

export const ProfileEdit = ({
	navigation,
}: {
	navigation: any;
}): JSX.Element => {
	const [form, setForm] = useState<BasicProfile | null>(null);

	const { slashtag, profile } = useSlashtags();

	const setField = (key, value): void => setForm({ ...form, [key]: value });

	const [image, setImage] = useState<string | null>(null);

	return (
		<View style={styles.container}>
			<SafeAreaInsets type={'top'} />
			<NavigationHeader title="Edit profile" />
			<View style={styles.content}>
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
							profile={{
								...profile,
								...(image && { image }),
							}}
							style={styles.profileImage}
						/>
					</TouchableOpacity>
				</View>
				<View style={styles.column}>
					<Input
						label="Profile name"
						value={profile?.name}
						onChange={(val): void => setField('name', val)}
					/>
					<Input
						label="About"
						value={profile?.about}
						multiline={true}
						onChange={(val): void => setField('about', val)}
					/>
				</View>
				<Button
					text="Save profile"
					size="large"
					onPress={async (): Promise<void> => {
						const toSave = form || {};
						if (image) {
							toSave.image = image;
						}

						if (JSON.stringify(toSave) !== JSON.stringify(profile)) {
							await slashtag?.setProfile({ ...profile, ...toSave });
						}
						setVisitedProfile(true);
						navigation.goBack();
					}}
				/>
			</View>
		</View>
	);
};

const Input = ({
	label,
	multiline,
	value,
	onChange,
}: {
	label: string;
	multiline?: boolean;
	value?: string;
	onChange: (value: string) => void;
}): JSX.Element => {
	return (
		<View style={styles.inputContainer}>
			<Text style={styles.Label}>{label}</Text>
			<View
				style={
					multiline
						? StyleSheet.compose(styles.input, styles.multiline)
						: styles.input
				}>
				<TextInput
					style={styles.inputText}
					defaultValue={value}
					color={'white'}
					autoCapitalize="none"
					autoCorrect={false}
					placeholder={label}
					onChangeText={onChange}
					multiline={multiline || false}
				/>
			</View>
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
	input: {
		display: 'flex',
		flexDirection: 'column',
		fontSize: 17,
		padding: 16,
		height: 52,
		borderRadius: 8,
		backgroundColor: 'rgba(255, 255, 255, 0.08)',
		boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.03)',
	},
	multiline: {
		height: 96,
	},
	Label: {
		fontWeight: '500',
		fontSize: 13,
		lineHeight: 18,
		textTransform: 'uppercase',
		color: '#8E8E93',
		marginBottom: 8,
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
	column: {
		flex: 1,
	},
	inputContainer: {
		marginBottom: 16,
	},
	inputText: {
		backgroundColor: 'transparent',
		flex: 1,
	},
});

export default ProfileEdit;
