import React from 'react';
import { Image, View, ViewStyle } from 'react-native';
import { BasicProfile } from '../store/types/slashtags';
import { Jdenticon } from './Jdenticon';

export const ProfileImage = ({
	id,
	profile,
	style,
	size = 32,
}: {
	id?: string;
	profile?: BasicProfile;
	style?: ViewStyle;
	size: number;
}): JSX.Element => {
	const _style: ViewStyle = {
		backgroundColor: '#222',
		borderRadius: size,
		overflow: 'hidden',
		height: size,
		width: size,
		...style,
	};

	if (!id) {
		return <View style={_style} />;
	}

	return (
		<View style={_style}>
			{profile?.image ? (
				<Image source={{ uri: profile.image, width: size, height: size }} />
			) : (
				<Jdenticon value={id} size={size} />
			)}
		</View>
	);
};

export default ProfileImage;
