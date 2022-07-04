import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { Text } from '../styles/components';
import { TouchableOpacity } from 'react-native-gesture-handler';
import Clipboard from '@react-native-clipboard/clipboard';
import colors from '../styles/colors';

export const SlashtagURL = ({
	url,
	style,
}: {
	url?: string;
	style?: ViewStyle;
}): JSX.Element => {
	return (
		<TouchableOpacity
			onLongPress={async (): Promise<void> => {
				if (url) {
					Clipboard.setString(url);
					console.debug('Copied slashtag url:', url);
				}
			}}
			style={StyleSheet.compose(style, styles.button)}
			activeOpacity={0.8}
			delayLongPress={500}>
			<Text style={styles.at}>@</Text>
			<Text style={styles.url}>
				{url?.slice(8, 13)}...{url?.slice(url.length - 6, -1)}
			</Text>
		</TouchableOpacity>
	);
};

const styles = StyleSheet.create({
	button: {
		display: 'flex',
		flexDirection: 'row',
	},
	url: {
		color: colors.brand,
		fontSize: 15,
		fontWeight: '800',
	},
	at: {
		color: colors.brand,
		fontSize: 15,
		opacity: 0.7,
	},
});
