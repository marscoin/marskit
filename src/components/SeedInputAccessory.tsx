import React, { ReactElement, useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import * as bip39 from 'bip39';
import { KeyboardAccessoryView } from 'react-native-keyboard-accessory';

import { Text13UP, Caption13S } from '../styles/components';
import { capitalize } from '../utils/helpers';
import seedSuggestions from '../utils/seed-suggestions';

const Word = ({ text, ...props }: { text: string }): ReactElement => {
	return (
		<TouchableOpacity style={styles.wordContainer} {...props}>
			<Caption13S color="brand" style={styles.wordText}>
				{text}
			</Caption13S>
		</TouchableOpacity>
	);
};

/**
 * Show keyboad accessory with seed suggestions
 */
const SeedInputAccessory = ({ word, setWord }): ReactElement => {
	const [suggestions, setSuggestions] = useState([]);

	useEffect(() => {
		if (word !== null) {
			const s = seedSuggestions(word, bip39.wordlists.english);
			setSuggestions(s);
		}
	}, [word]);

	const content = (
		<View style={styles.suggestions}>
			<Text13UP color="gray1">SUGGESTIONS</Text13UP>
			<View style={styles.suggestionsRow}>
				{suggestions.map((s) => (
					<Word text={capitalize(s)} key={s} onPress={(): void => setWord(s)} />
				))}
			</View>
		</View>
	);

	return (
		<KeyboardAccessoryView hideBorder androidAdjustResize>
			{content}
		</KeyboardAccessoryView>
	);
};

const styles = StyleSheet.create({
	suggestions: {
		backgroundColor: 'black',
		paddingHorizontal: 48,
		paddingVertical: 16,
	},
	suggestionsRow: {
		flexDirection: 'row',
		marginTop: 14,
		minHeight: 38,
	},
	wordContainer: {
		backgroundColor: 'rgba(255, 255, 255, 0.08)',
		paddingHorizontal: 16,
		paddingVertical: 10,
		borderRadius: 54,
		marginRight: 8,
	},
	wordText: {
		fontWeight: 'bold',
	},
});

export default SeedInputAccessory;
