import React from 'react';
import { Text } from '../styles/components';
import { TouchableOpacity } from 'react-native-gesture-handler';
import Clipboard from '@react-native-clipboard/clipboard';

export const SlashtagURL = ({ url, style }: { url?: string; style?: any }) => {
	return (
		<TouchableOpacity
			onLongPress={async () => {
				if (url) {
					Clipboard.setString(url);
					console.debug('Copied slashtag url:', url);
				}
			}}
			style={{ ...style, display: 'flex', flexDirection: 'row' }}
			activeOpacity={0.8}
			delayLongPress={500}>
			<Text style={{ ...styles.url, opacity: 0.7 }}>@</Text>
			<Text style={{ ...styles.url, fontWeight: '800' }}>
				{url?.slice(8, 13)}...{url?.slice(url.length - 6, -1)}
			</Text>
		</TouchableOpacity>
	);
};

const styles = {
	url: {
		color: '#f60',
		lineHeight: 20,
		fontSize: 15,
	},
};
