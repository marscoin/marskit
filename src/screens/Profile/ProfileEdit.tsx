import React, { useState } from 'react';
import { Text, TextInput, View } from '../../styles/components';
import NavigationHeader from '../../components/NavigationHeader';
import Button from '../../components/Button';
import { useSlashtags } from '../../hooks/slashtags';
import type { SDK } from '@synonymdev/slashtags-sdk/types/src/index';
import SafeAreaInsets from '../../components/SafeAreaInsets';
import { BasicProfile } from '../../store/types/slashtags';
import { StyleSheet } from 'react-native';

export const ProfileEdit = ({
	navigation,
}: {
	slashtag?: ReturnType<SDK['slashtag']>;
	navigation: any;
	profile: BasicProfile;
}) => {
	const [form, setForm] = useState<BasicProfile | null>(null);

	const { slashtag, profile } = useSlashtags();

	const setField = (key, value) => setForm({ ...form, [key]: value });

	return (
		<View style={styles.container}>
			<SafeAreaInsets type={'top'} />
			<NavigationHeader title="Edit profile" />
			<View style={styles.content}>
				<View style={{ flex: 1 }}>
					<Input
						label="Profile name"
						value={profile?.name}
						onChange={(val) => setField('name', val)}></Input>
					<Input
						label="About"
						value={profile?.about}
						multiline={true}
						onChange={(val) => setField('about', val)}></Input>
				</View>
				<Button
					text="Save profile"
					size="large"
					onPress={async () => {
						if (form && JSON.stringify(form) !== JSON.stringify(profile)) {
							await slashtag?.setProfile({ ...profile, ...form });
						}
						navigation.goBack();
					}}></Button>
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
}) => {
	return (
		<View style={{ marginBottom: 16 }}>
			<Text style={styles.Label}>{label}</Text>
			<View style={{ ...styles.input, ...(multiline ? { height: 92 } : {}) }}>
				<TextInput
					style={{ backgroundColor: 'transparent', flex: 1 }}
					defaultValue={value}
					color={'white'}
					autoCapitalize="none"
					autoCorrect={false}
					placeholder={label}
					onChangeText={onChange}
					multiline={multiline || false}></TextInput>
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
	Label: {
		fontWeight: '500',
		fontSize: 13,
		lineHeight: 18,
		textTransform: 'uppercase',
		color: '#8E8E93',
		marginBottom: 8,
	},
	divider: {
		height: 2,
		backgroundColor: 'rgba(255, 255, 255, 0.1)',

		marginTop: 16,
		marginBottom: 16,
	},
	bottom: {
		flex: 1,
		display: 'flex',
		flexDirection: 'column',
	},
	button: {
		fontWeight: '800',
	},
});

export default ProfileEdit;
