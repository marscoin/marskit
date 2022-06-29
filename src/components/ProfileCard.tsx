import React from 'react';
import { BasicProfile } from '../store/types/slashtags';
import { Text, TitleHaas, View } from '../styles/components';
import { Jdenticon } from './Jdenticon';
import { SlashtagURL } from './SlashtagURL';
import Button from '../components/Button';

export const ProfileCard = ({
	profile,
	actions,
}: {
	id?: string;
	profile?: BasicProfile;
	actions?: { label: string; onPress? }[];
}) => {
	return (
		<View style={styles.container}>
			<View style={styles.row}>
				<Jdenticon size={84} value={profile?.id} />
				<View style={styles.actions}>
					{actions?.map((act) => (
						<Button text={act.label} onPress={act.onPress}></Button>
					))}
				</View>
			</View>
			<TitleHaas style={styles.name}>{profile?.name || 'Your name'}</TitleHaas>
			<SlashtagURL url={profile?.id} />
			<Text style={styles.about}>
				{profile?.about?.slice(0, 160) || 'About ...'}
			</Text>
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
		alignItems: 'center',
		justifyContent: 'space-between',
		marginBottom: 16,
	},
	column: {
		// flex: 1,
		// marginLeft: 16,
	},
	name: {
		fontSize: 34,
	},
	about: {
		fontSize: 18,
		lineHeight: 20,
		color: '#8E8E93',
		marginTop: 16,
	},
	actions: {
		display: 'flex',
		flexDirection: 'row',
	},
};

export default ProfileCard;
