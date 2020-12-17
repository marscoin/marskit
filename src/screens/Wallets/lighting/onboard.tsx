import React, { memo, useEffect, useState } from 'react';
import { Text, View } from '../../../styles/components';
import { StyleSheet } from 'react-native';
import Button from '../../../components/Button';
import { copyNewAddressToClipboard } from '../../../utils/lightning';
import lnd from 'react-native-lightning';

/**
 * Temporary component to move funds onto the lightning network
 * @returns {JSX.Element}
 * @constructor
 */
const TempLightningOnboard = () => {
	const [content, setContent] = useState<string>('');

	useEffect(() => {
		(async () => {
			const balanceRes = await lnd.getWalletBalance();
			if (balanceRes.isErr()) {
				return;
			}
		})();
	}, []);

	return (
		<View style={styles.container}>
			<Text style={styles.text}>Lightning wallet</Text>

			<Button
				text={'Add funds'}
				onPress={async () => {
					//TODO this will probably not be needed when the on chain wallet is ready

					const address = await copyNewAddressToClipboard();
					setContent(`${address}\nCopied to clipboard!`);
				}}
			/>

			<Text style={styles.text}>{content}</Text>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		marginTop: 20,
	},
	text: {
		textAlign: 'center',
	},
});

export default memo(TempLightningOnboard);
