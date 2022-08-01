import React, { memo, ReactElement, useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import {
	Subtitle,
	Title,
	View,
	TouchableOpacity,
} from '../../../styles/components';
import NavigationHeader from '../../../components/NavigationHeader';
import SafeAreaInsets from '../../../components/SafeAreaInsets';
import { getNodeId } from '../../../utils/lightning';
import Clipboard from '@react-native-clipboard/clipboard';
import { showSuccessNotification } from '../../../utils/notifications';
import { useSelector } from 'react-redux';
import Store from '../../../store/types';

const LightningNodeInfo = ({
	title,
	showBackNavigation = true,
}: {
	title: string;
	showBackNavigation: boolean;
}): ReactElement => {
	const selectedNetwork = useSelector(
		(state: Store) => state.wallet.selectedNetwork,
	);
	const [nodeId, setNodeId] = useState('');

	useEffect(() => {
		(async (): Promise<void> => {
			// TODO: Remove if condition once testnet and mainnet are enabled.
			if (selectedNetwork === 'bitcoinRegtest') {
				const id = await getNodeId();
				if (id.isOk()) {
					setNodeId(id.value);
				} else {
					setNodeId(id.error.message);
				}
			} else {
				setNodeId('LDK is only enabled for regtest at this time.');
			}
		})();
	}, [selectedNetwork]);

	return (
		<View style={styles.container} color="black">
			<SafeAreaInsets type="top" />
			<NavigationHeader title={title} displayBackButton={showBackNavigation} />

			<View style={styles.content} color="black">
				<TouchableOpacity
					// TODO: Remove disabled condition once testnet and mainnet are enabled.
					disabled={selectedNetwork !== 'bitcoinRegtest'}
					onPress={(): void => {
						Clipboard.setString(nodeId);
						showSuccessNotification({
							title: 'Copied LDK Node ID to Clipboard',
							message: nodeId,
						});
					}}
					color="black">
					<Title>LDK Node ID:</Title>
					<Subtitle>{nodeId}</Subtitle>
				</TouchableOpacity>
			</View>

			<SafeAreaInsets type="bottom" />
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: 'rgba(255, 255, 255, 0)',
		alignItems: 'center',
	},
	content: {
		marginHorizontal: 20,
	},
});

export default memo(LightningNodeInfo);
