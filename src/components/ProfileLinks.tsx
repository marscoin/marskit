import React, { ReactElement } from 'react';
import {
	View,
	TouchableOpacity,
	StyleProp,
	StyleSheet,
	ViewStyle,
} from 'react-native';
import { useTranslation } from 'react-i18next';

import { Caption13Up, Text02M, Text02S } from '../styles/text';
import { TrashIcon } from '../styles/icons';
import { LocalLink } from '../store/types/slashtags';
import { openURL } from '../utils/helpers';
import { editLink, removeLink } from '../store/actions/slashtags';
import LabeledInput from './LabeledInput';
import Divider from './Divider';

const ProfileLinks = ({
	links,
	editable = false,
	style,
}: {
	links: LocalLink[];
	editable?: boolean;
	style?: StyleProp<ViewStyle>;
}): ReactElement => {
	const { t } = useTranslation('slashtags');

	return (
		<View style={style}>
			{!editable && links?.length === 0 ? (
				<>
					<Text02S color="gray1">{t('contact_no_links')}</Text02S>
					<Divider />
				</>
			) : (
				links.map((link): JSX.Element => {
					const trimmedUrl = link.url
						.replace('https://', '')
						.replace('www.', '')
						.replace('twitter.com/', '@');

					return editable ? (
						<LabeledInput
							key={link.id}
							style={styles.input}
							label={link.title}
							value={link.url}
							onChange={(value: string): void => {
								editLink({
									id: link.id,
									title: link.title,
									url: value,
								});
							}}>
							<TouchableOpacity
								testID="RemoveLinkButton"
								onPress={(): void => {
									removeLink(link.id);
								}}>
								<TrashIcon color="brand" width={16} />
							</TouchableOpacity>
						</LabeledInput>
					) : (
						<TouchableOpacity
							key={link.id}
							onPress={(): void => {
								openURL(link.url);
							}}>
							<Caption13Up style={styles.label} color="gray1">
								{link.title}
							</Caption13Up>
							<Text02M numberOfLines={1}>{trimmedUrl}</Text02M>
							<Divider />
						</TouchableOpacity>
					);
				})
			)}
		</View>
	);
};

const styles = StyleSheet.create({
	label: {
		marginBottom: 8,
	},
	input: {
		marginBottom: 16,
	},
});

export default ProfileLinks;
