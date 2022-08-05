import React from 'react';
import { Image, View, ViewStyle } from 'react-native';
import { BasicProfile } from '../store/types/slashtags';
import { Jdenticon } from './Jdenticon';

export const ProfileImage = ({
	url,
	image,
	style,
	size = 32,
}: {
	url?: string;
	image?: BasicProfile['image'];
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

	return (
		<View style={_style}>
			{image ? (
				<Image source={{ uri: image, width: size, height: size }} />
			) : url ? (
				<Jdenticon value={url} size={size} />
			) : (
				<View style={_style} />
			)}
		</View>
	);
};

export default ProfileImage;
