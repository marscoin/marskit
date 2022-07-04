import React from 'react';
import { Text, TrashIcon, View } from '../styles/components';
import { BasicProfile } from '../store/types/slashtags';
import { StyleProp, StyleSheet } from 'react-native';
import LabeledInput from './LabeledInput';

const ProfileDetails = ({
	profile,
	setField,
	style = {},
}: {
	profile?: BasicProfile;
	setField?: (key: string, value: string | undefined) => void;
	style?: StyleProp<any> | StyleProp<any>[];
}): JSX.Element => {
	const reserved = ['name', 'image', 'id', 'bio'];
	const nonEmpty = ([key, value]): void =>
		!reserved.includes(key) && value && value?.length > 0;
	const entries = profile ? Object.entries(profile).filter(nonEmpty) : [];

	const editable = setField;

	const Input = ({
		label,
		deletable,
	}: {
		label: string;
		deletable: boolean;
	}): JSX.Element => {
		return (
			<LabeledInput
				label={label}
				value={profile?.[label]}
				onChange={editable && ((val): void => setField('website', val))}
				rightIcon={
					editable && deletable ? (
						<TrashIcon color="brand" width={16} />
					) : undefined
				}
				onRightIconPress={editable && ((): void => setField(label, undefined))}
			/>
		);
	};

	return (
		<View style={StyleSheet.compose(styles.detailsViewContainer, style)}>
			{!editable && entries.length === 0 ? (
				<Text style={styles.detailsViewNote}>No details added yet...</Text>
			) : (
				entries.map(
					([key]): JSX.Element => <Input label={key} deletable={true} />,
				)
			)}
		</View>
	);
};

const styles = StyleSheet.create({
	detailsViewContainer: {
		display: 'flex',
	},
	detailsViewNote: {
		opacity: 0.5,
	},
});

export default ProfileDetails;
