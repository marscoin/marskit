import React from 'react';
import { BasicProfile } from '../store/types/slashtags';
import { Text, TitleHaas, View } from '../styles/components';
import { truncate } from '../utils/helpers';
import ProfileImage from './ProfileImage';
import { SlashtagURL } from './SlashtagURL';

export const ProfileCard = ({
	profile,
}: {
	id?: string;
	profile?: BasicProfile;
}): JSX.Element => {
	return (
		<View style={styles.container}>
			<View style={styles.row}>
				<View>
					{profile?.name
						?.split(' ')
						.slice(0, 2)
						.map((name, index) => (
							<TitleHaas key={name} style={styles.name}>
								{truncate(name, 16)}
								{index === 1 &&
								profile?.name &&
								profile.name.split(' ').length > 2
									? ' ...'
									: ''}
							</TitleHaas>
						))}
					<SlashtagURL style={styles.url} url={profile?.id} />
				</View>
				<ProfileImage profile={profile} size={96} />
			</View>

			<Text style={styles.bio}>{profile?.bio?.slice(0, 160) || 'Bio ...'}</Text>
		</View>
	);
};

const styles = {
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
		lineHeight: 34,
	},
	bio: {
		fontSize: 22,
		lineHeight: 26,
		color: '#8E8E93',
	},
	actions: {
		display: 'flex',
		flexDirection: 'row',
	},
	url: {
		marginTop: 16,
	},
};

export default ProfileCard;
