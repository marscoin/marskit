import React, { ReactElement, useState } from 'react';
import { View, StyleSheet, Keyboard } from 'react-native';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

import {
	View as ThemedView,
	TouchableOpacity as ThemedTouchableOpacity,
} from '../../styles/components';
import { PlusIcon } from '../../styles/icons';
import ContactsOnboarding from './ContactsOnboarding';
import NavigationHeader from '../../components/NavigationHeader';
import SafeAreaInset from '../../components/SafeAreaInset';
import SearchInput from '../../components/SearchInput';
import ContactsList from '../../components/ContactsList';
import { showBottomSheet } from '../../store/actions/ui';
import { useProfile, useSelectedSlashtag } from '../../hooks/slashtags';
import { RootStackScreenProps } from '../../navigation/types';
import AddContact from './AddContact';
import { onboardedContactsSelector } from '../../store/reselect/slashtags';
import { useSlashtags } from '../../components/SlashtagsProvider';
import { IContactRecord } from '../../store/types/slashtags';
import ProfileImage from '../../components/ProfileImage';

const Contacts = (props: RootStackScreenProps<'Contacts'>): ReactElement => {
	const onboarded = useSelector(onboardedContactsSelector);
	const contacts = useSlashtags().contacts as { [url: string]: IContactRecord };
	const showOnboarding = !onboarded && Object.keys(contacts).length === 0;

	return showOnboarding ? (
		<ContactsOnboarding {...props} />
	) : (
		<ContactsScreen {...props} />
	);
};

const ContactsScreen = ({
	navigation,
}: RootStackScreenProps<'Contacts'>): ReactElement => {
	const { t } = useTranslation('slashtags');
	const [searchFilter, setSearchFilter] = useState('');
	const { url: myProfileURL } = useSelectedSlashtag();
	const { profile } = useProfile(myProfileURL);

	return (
		<ThemedView style={styles.container}>
			<SafeAreaInset type="top" />
			<NavigationHeader
				title={t('contacts')}
				onClosePress={(): void => {
					navigation.navigate('Wallet');
				}}
				actionIcon={
					<ProfileImage size={28} url={myProfileURL} image={profile?.image} />
				}
				onActionPress={(): void => navigation.navigate('Profile')}
			/>
			<View style={styles.content}>
				<View style={styles.searchRow}>
					<SearchInput
						style={styles.searchInput}
						value={searchFilter}
						onChangeText={setSearchFilter}
						testID="ContactsSearchInput"
					/>
					<ThemedTouchableOpacity
						style={styles.addButton}
						color="white08"
						activeOpacity={0.8}
						onPress={(): void => {
							Keyboard.dismiss();
							showBottomSheet('addContactModal');
						}}
						testID="AddContact">
						<PlusIcon width={24} height={24} color="brand" />
					</ThemedTouchableOpacity>
				</View>
				<View style={styles.contacts}>
					<ContactsList
						searchFilter={searchFilter}
						includeMyProfile={true}
						onPress={({ url }): void => {
							const isContact = url !== myProfileURL;
							if (isContact) {
								navigation.navigate('Contact', { url });
							} else {
								navigation.navigate('Profile');
							}
						}}
					/>
				</View>
			</View>

			<AddContact navigation={navigation} />
		</ThemedView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	content: {
		flex: 1,
		justifyContent: 'space-between',
		paddingHorizontal: 16,
	},
	searchRow: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 32,
	},
	searchInput: {
		flex: 1,
	},
	addButton: {
		alignItems: 'center',
		justifyContent: 'center',
		height: 48,
		width: 48,
		marginLeft: 8,
		borderRadius: 999,
	},
	contacts: {
		flex: 1,
	},
});

export default Contacts;
