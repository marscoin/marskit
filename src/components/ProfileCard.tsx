import React, { useRef } from 'react';
import { useEffect } from 'react';
import { TextInput as ITextInput, StyleSheet } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { BasicProfile } from '../store/types/slashtags';
import { Text, Title, TextInput, View, CameraIcon } from '../styles/components';
import { profileNameMultiLine } from '../utils/helpers';
import ProfileImage from './ProfileImage';
import { SlashtagURL } from './SlashtagURL';
import { launchImageLibrary } from 'react-native-image-picker';

export const ProfileCard = ({
	profile,
	editable,
	onChange,
}: {
	id?: string;
	profile?: BasicProfile;
	editable?: boolean;
	onChange?: (name, val) => void;
}): JSX.Element => {
	const name = profile?.name;
	const bio = profile?.bio?.slice?.(0, 160);

	const nameRef = useRef<ITextInput | null>(null);
	const bioRef = useRef<ITextInput | null>(null);

	useEffect(() => {
		nameRef.current?.focus();
	}, [nameRef.current]);

	return (
		<View style={styles.container}>
			<View style={styles.row}>
				<View>
					{editable ? (
						<TextInput
							ref={nameRef}
							autoFucus={true}
							style={styles.name}
							value={name?.replace(/\s+/g, '\n')}
							placeholder={'Your public\nprofile name'}
							multiline={true}
							onChangeText={(value) => {
								if (value.slice(-1) === '\t') {
									bioRef.current?.focus();
								} else {
									onChange?.('name', value.replace(/\n/g, ' '));
								}
							}}
						/>
					) : (
						<Title style={styles.name}>{profileNameMultiLine(name)}</Title>
					)}
					<SlashtagURL style={styles.url} url={profile?.id} />
				</View>
				{editable ? (
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
							base64 && onChange?.('image', `data:${type};base64,` + base64);
						}}>
						<CameraIcon style={styles.cameraIcon} />
						<ProfileImage
							size={96}
							profile={profile}
							style={styles.profileImage}
						/>
					</TouchableOpacity>
				) : (
					<ProfileImage profile={profile} size={96} />
				)}
			</View>

			{editable ? (
				<TextInput
					ref={bioRef}
					style={styles.bio}
					value={bio}
					placeholder={'Short bio. Tell a bit about yourself.'}
					onChangeText={(value) => onChange?.('bio', value)}
				/>
			) : (
				<Text style={styles.bio}>{bio}</Text>
			)}
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		display: 'flex',
		flexDirection: 'column',
	},
	row: {
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'flex-start',
		justifyContent: 'space-between',
		marginBottom: 16,
	},
	name: {
		fontSize: 34,
		fontFamily: 'NHaasGroteskDSW02-65Md',
		backgroundColor: 'transparent',
	},
	bio: {
		fontSize: 22,
		lineHeight: 26,
		backgroundColor: 'transparent',
		color: '#8E8E93',
	},
	actions: {
		display: 'flex',
		flexDirection: 'row',
	},
	url: {
		marginTop: 16,
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
});

export default ProfileCard;
