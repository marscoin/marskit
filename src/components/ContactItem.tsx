import React from 'react';
import { BasicProfile } from '../store/types/slashtags';
import { Text01B, View } from '../styles/components';
import { TouchableOpacity } from 'react-native-gesture-handler';
import ProfileImage from './ProfileImage';
import { SlashtagURL } from './SlashtagURL';

export const ContactItem = ({
	id,
	profile,
	navigation,
}: {
	id?: string;
	profile?: BasicProfile;
	navigation: any;
}): JSX.Element => {
	return (
		<TouchableOpacity
			activeOpacity={0.8}
			onPress={(): void => {
				navigation.navigate('Profile', { id });
			}}>
			<View style={styles.container}>
				<ProfileImage id={id} profile={profile} size={48} />
				<View style={styles.column}>
					<Text01B style={styles.name}>{profile?.name}</Text01B>
					<SlashtagURL style={styles.url} color="gray" url={id} />
				</View>
			</View>
		</TouchableOpacity>
	);
};

const styles = {
	container: {
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
		marginTop: 10,
		marginBottom: 10,
	},
	column: {
		marginLeft: 16,
	},
	name: { marginBottom: 4 },
	url: {},
};

export default ContactItem;
