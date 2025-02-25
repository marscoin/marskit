import React, { memo, ReactElement } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';

import NavigationHeader from '../../components/NavigationHeader';
import { View as ThemedView } from '../../styles/components';
import Button from '../../components/Button';
import { updateProfileLink } from '../../store/actions/ui';
import SafeAreaInset from '../../components/SafeAreaInset';
import type { RootStackScreenProps } from '../../navigation/types';

const suggestions = [
	'Email',
	'Phone',
	'Website',
	'Twitter',
	'Telegram',
	'Instagram',
	'Facebook',
	'LinkedIn',
	'Github',
	'Calendly',
	'Vimeo',
	'YouTube',
	'Twitch',
	'Pinterest',
	'TikTok',
	'Spotify',
];

const ProfileLinkSuggestions = ({
	navigation,
}: RootStackScreenProps<'ProfileLinkSuggestions'>): ReactElement => {
	const { t } = useTranslation('slashtags');

	const handleChoose = (suggestion: string): void => {
		updateProfileLink({ title: suggestion });
		navigation.goBack();
	};

	return (
		<ThemedView style={styles.container}>
			<SafeAreaInset type="top" />
			<NavigationHeader title={t('profile_link_suggestions_to_add')} />
			<View style={styles.buttons}>
				{suggestions.map((suggestion) => (
					<Button
						key={suggestion}
						text={suggestion}
						style={styles.button}
						color="white16"
						onPress={(): void => handleChoose(suggestion)}
					/>
				))}
			</View>
		</ThemedView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	buttons: {
		paddingHorizontal: 16,
		flexDirection: 'row',
		flexWrap: 'wrap',
		justifyContent: 'flex-start',
	},
	button: {
		marginRight: 8,
		marginTop: 8,
		minWidth: 50,
	},
});

export default memo(ProfileLinkSuggestions);
