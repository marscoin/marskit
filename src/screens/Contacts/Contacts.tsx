import React, { useState } from 'react';
import { PlusIcon, Text, View } from '../../styles/components';
import NavigationHeader from '../../components/NavigationHeader';
import { StyleSheet } from 'react-native';
import Store from '../../store/types';
import { useSelector } from 'react-redux';
import { useSlashtagProfile } from '../../hooks/slashtags';
import SafeAreaInsets from '../../components/SafeAreaInsets';
import ContactsOnboarding from './ContactsOnboarding';
import { TouchableOpacity } from 'react-native-gesture-handler';
import SearchInput from '../../components/SearchInput';
import ContactItem from '../../components/ContactItem';

export const Contacts = ({ navigation }): JSX.Element => {
	const onboardedProfile = useSelector(
		(store: Store) => store.slashtags.visitedContacts,
	);

	const profile = useSlashtagProfile();

	const [searchFilter, setSearchFilter] = useState('');

	return onboardedProfile ? (
		<View style={styles.container}>
			<SafeAreaInsets type={'top'} />
			<NavigationHeader
				title="Contacts"
				displayBackButton={false}
				onClosePress={(): void => {
					navigation.navigate('Tabs');
				}}
			/>
			<View style={styles.content}>
				<View style={styles.row}>
					<SearchInput
						style={styles.searchInput}
						value={searchFilter}
						onChangeText={setSearchFilter}
					/>
					<TouchableOpacity
						style={styles.addButton}
						activeOpacity={0.8}
						onPress={(): void => {
							navigation.navigate('AddContact');
						}}>
						<PlusIcon widht={24} height={24} color="brand" />
					</TouchableOpacity>
				</View>
				<View style={styles.contacts}>
					<Text style={styles.label}>My profile</Text>
					<View style={styles.divider} />
					<ContactItem navigation={navigation} profile={profile} />
					<View style={styles.divider} />
				</View>
			</View>
		</View>
	) : (
		<ContactsOnboarding navigation={navigation} />
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
	row: {
		display: 'flex',
		flexDirection: 'row',
	},
	searchInput: {
		flex: 1,
		marginBottom: 16,
	},
	addButton: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		height: 48,
		width: 48,
		marginLeft: 8,
		borderRadius: 999,
		backgroundColor: 'rgba(255, 255, 255, 0.08)',
	},
	label: {
		fontWeight: '500',
		fontSize: 13,
		lineHeight: 18,
		textTransform: 'uppercase',
		color: '#8E8E93',
		marginBottom: 8,
	},
	contacts: {
		flex: 1,
	},
	divider: {
		height: 2,
		backgroundColor: 'rgba(255, 255, 255, 0.1)',
		marginTop: 16,
		marginBottom: 16,
	},
});

export default Contacts;
