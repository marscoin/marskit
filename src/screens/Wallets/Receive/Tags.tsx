import React, { memo, ReactElement, useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

import { BottomSheetTextInput } from '../../../styles/components';
import { Caption13Up } from '../../../styles/text';
import GradientView from '../../../components/GradientView';
import BottomSheetNavigationHeader from '../../../components/BottomSheetNavigationHeader';
import SafeAreaInset from '../../../components/SafeAreaInset';
import Button from '../../../components/Button';
import Tag from '../../../components/Tag';
import { Keyboard } from '../../../hooks/keyboard';
import { lastUsedTagsSelector } from '../../../store/reselect/metadata';
import { updateInvoice } from '../../../store/actions/receive';
import { addTag, deleteTag } from '../../../store/actions/metadata';
import { ReceiveScreenProps } from '../../../navigation/types';

const Tags = ({ navigation }: ReceiveScreenProps<'Tags'>): ReactElement => {
	const { t } = useTranslation('wallet');
	const [text, setText] = useState('');
	const lastUsedTags = useSelector(lastUsedTagsSelector);

	const handleSubmit = useCallback(async (): Promise<void> => {
		if (text.length === 0) {
			return;
		}
		updateInvoice({ tags: [text] });
		addTag(text);
		await Keyboard.dismiss();
		navigation.goBack();
	}, [navigation, text]);

	const handleTagChoose = useCallback(
		async (tag: string): Promise<void> => {
			updateInvoice({ tags: [tag] });
			addTag(tag);
			await Keyboard.dismiss();
			navigation.goBack();
		},
		[navigation],
	);

	return (
		<GradientView style={styles.container}>
			<BottomSheetNavigationHeader title={t('tags_add')} />
			<View style={styles.content}>
				{lastUsedTags.length !== 0 && (
					<>
						<Caption13Up color="gray1" style={styles.section}>
							{t('tags_previously')}
						</Caption13Up>
						<View style={styles.tagsContainer}>
							{lastUsedTags.map((tag) => (
								<Tag
									key={tag}
									style={styles.tag}
									value={tag}
									testID={`Tag-${tag}`}
									onPress={(): void => {
										handleTagChoose(tag);
									}}
									onClose={(): void => {
										deleteTag(tag);
									}}
								/>
							))}
						</View>
					</>
				)}
				<Caption13Up color="gray1" style={styles.section}>
					{t('tags_new')}
				</Caption13Up>
				<BottomSheetTextInput
					placeholder={t('tags_new_enter')}
					blurOnSubmit={false}
					value={text}
					onChangeText={setText}
					onSubmitEditing={handleSubmit}
					maxLength={15}
					returnKeyType="done"
					testID="TagInputReceive"
				/>

				<View style={styles.buttonContainer}>
					<Button
						text={t('tags_add_button')}
						size="large"
						disabled={text.length === 0}
						testID="ReceiveTagsSubmit"
						onPress={handleSubmit}
					/>
				</View>
			</View>
			<SafeAreaInset type="bottom" minPadding={16} />
		</GradientView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	content: {
		flex: 1,
		paddingHorizontal: 16,
	},
	section: {
		marginBottom: 16,
	},
	tagsContainer: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		marginBottom: 32,
	},
	tag: {
		marginRight: 8,
		marginBottom: 8,
	},
	buttonContainer: {
		marginTop: 'auto',
		flex: 1,
		justifyContent: 'flex-end',
	},
});

export default memo(Tags);
