import React, { memo, PropsWithChildren, ReactElement, useState } from 'react';
import Clipboard from '@react-native-clipboard/clipboard';
import {
	Text01M,
	View,
	Text01S,
	Text02S,
	TouchableOpacity,
	Caption13M,
	CopyIcon,
} from '../../../../styles/components';
import SettingsView from '../../SettingsView';
import { StyleSheet } from 'react-native';
import { applyAlpha } from '../../../../utils/helpers';
import { useSelector } from 'react-redux';
import Store from '../../../../store/types';
import themes from '../../../../styles/themes';
import SafeAreaInsets from '../../../../components/SafeAreaInsets';
import { showErrorNotification } from '../../../../utils/notifications';

interface Props extends PropsWithChildren<any> {
	route: { params: { title: string; words: string[] } };
}

const WordItem = ({
	index,
	word,
	compact,
}: {
	index: number;
	word: string;
	compact: boolean;
}): ReactElement => {
	const TextComponent = compact ? Text02S : Text01M;
	return (
		<View
			color={'transparent'}
			style={compact ? styles.wordContainerCompact : styles.wordContainer}>
			<TextComponent color={'brand'} style={styles.wordIndex}>
				{index}.
			</TextComponent>
			<TextComponent>{word}</TextComponent>
		</View>
	);
};

type WordCol = {
	index: number;
	word: string;
};

const splitWords = (words: string[], columns: number): WordCol[][] => {
	const wordsPerColumn = Math.round(words.length / columns);
	let wordColumns: WordCol[][] = [];
	let wordIndex = 0;

	for (let col = 0; col < columns; col++) {
		wordColumns[col] = [];

		for (let index = 0; index < wordsPerColumn; index++) {
			const word = words[wordIndex];
			if (word) {
				wordColumns[col].push({
					index: wordIndex + 1,
					word,
				});
			}

			wordIndex++;
		}
	}

	return wordColumns;
};

const ViewSeed = (props: Props): ReactElement => {
	const { title, words: allWords } = props.route.params;

	const compactLayout = allWords.length > 12;

	const wordColumns = splitWords(allWords, 2);

	const defaultCopyText = 'Copy seed';

	const [copyButtonText, setCopyButtonText] = useState(defaultCopyText);

	const themeColors = useSelector(
		(state: Store) => themes[state.settings.theme].colors,
	);

	const onCopyPress = (): void => {
		try {
			Clipboard.setString(allWords.join(' '));
			setCopyButtonText('Copied!');
			setTimeout(() => {
				setCopyButtonText(defaultCopyText);
			}, 1000);
		} catch (e) {
			console.log(e);
			showErrorNotification({
				title: 'Unable to copy item to clipboard.',
				message: "Please try again or check your phone's permissions.",
			});
		}
	};

	return (
		<SettingsView title={`${title} Seed`} showBackNavigation>
			<View color="transparent" style={styles.content}>
				<View color={'transparent'} style={styles.titleContainer}>
					<Text01M>Your recovery phrase</Text01M>
					<Text01S color={'gray1'}>
						Write down or copy these words in the right order and save them
						somewhere safe.
					</Text01S>
				</View>

				<View
					style={[
						styles.block,
						{ backgroundColor: applyAlpha(themeColors.gray3, 0.1) },
					]}>
					<View color={'transparent'} style={styles.wordsContainer}>
						{wordColumns.map((words, col) => (
							<View
								key={col}
								color={'transparent'}
								style={compactLayout ? styles.wordColCompact : styles.wordCol}>
								{words.map(({ word, index }) => (
									<WordItem
										key={index}
										word={word}
										index={index}
										compact={compactLayout}
									/>
								))}
							</View>
						))}
					</View>
					<TouchableOpacity
						color={'transparent'}
						style={styles.copyButtonContainer}
						onPress={onCopyPress}>
						<View
							style={[
								styles.copyButton,
								{ backgroundColor: applyAlpha(themeColors.white, 0.08) },
							]}>
							<CopyIcon style={styles.copyIcon} />
							<Caption13M color={'brand'}>{copyButtonText}</Caption13M>
						</View>
					</TouchableOpacity>
				</View>

				<View color={'transparent'} style={styles.footer}>
					<Text02S color={'gray1'} style={styles.footerText}>
						👆
						{'\n\n'}
						<Text02S color={'brand'}>We recommend</Text02S> writing your
						passphrase down on paper and storing copies in various locations.
						{'\n\n'}
						<Text02S color={'brand'}>Never share</Text02S> recovery phrase with
						anyone.
					</Text02S>
				</View>
			</View>

			<SafeAreaInsets type={'bottom'} />
		</SettingsView>
	);
};

const styles = StyleSheet.create({
	content: {
		flex: 1,
	},
	titleContainer: {
		paddingHorizontal: 28,
	},
	block: {
		marginHorizontal: 40,
		marginTop: 31,
		paddingVertical: 17,
		borderRadius: 16,
		display: 'flex',
	},
	wordsContainer: {
		display: 'flex',
		flexDirection: 'row',
	},
	wordCol: {
		flex: 1,
		paddingLeft: 10,
	},
	wordColCompact: {
		flex: 1,
		paddingLeft: 0,
	},
	wordContainer: {
		display: 'flex',
		flexDirection: 'row',
		marginBottom: 12,
	},
	wordContainerCompact: {
		display: 'flex',
		flexDirection: 'row',
		marginBottom: 8,
	},
	wordIndex: {
		width: 34,
		marginRight: 8,
		textAlign: 'right',
	},
	copyButtonContainer: {
		display: 'flex',
		flexDirection: 'row',
		justifyContent: 'center',
		paddingTop: 5,
	},
	copyButton: {
		display: 'flex',
		flexDirection: 'row',
		justifyContent: 'center',
		borderRadius: 10,
		paddingHorizontal: 8,
		paddingVertical: 5,
	},
	copyIcon: {
		marginRight: 4,
	},
	footer: {
		flex: 1,
		display: 'flex',
		justifyContent: 'flex-end',
		paddingHorizontal: 17,
		paddingVertical: 10,
	},
	footerText: {
		textAlign: 'center',
	},
});

export default memo(ViewSeed);
