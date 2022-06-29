import React from 'react';
import { Image, View, ViewStyle } from 'react-native';
import { BasicProfile } from '../store/types/slashtags';
import { Jdenticon } from './Jdenticon';

export const ProfileImage = ({
	profile,
	style,
	size = 32,
}: {
	profile?: BasicProfile;
	style?: ViewStyle;
	size: number;
}) => {
	const _style: ViewStyle = {
		backgroundColor: '#222',
		borderRadius: size,
		overflow: 'hidden',
		...style,
	};

	if (!profile?.id) return <View style={_style} />;

	return (
		<View style={_style}>
			{profile.image ? (
				<Image source={{ uri: profile.image, width: size, height: size }} />
			) : (
				<Jdenticon value={profile?.id} size={size} />
			)}
		</View>
	);
};

export default ProfileImage;
