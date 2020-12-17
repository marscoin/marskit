/**
 * @format
 * @flow strict-local
 */

import React, { memo, useState } from 'react';
import { LayoutAnimation, StyleSheet } from 'react-native';
import { View, Text } from '../../../styles/components';
import Receive from './../Receive';
import Button from '../../../components/Button';
import AssetCard from '../../../components/AssetCard';
import { useNavigation } from '@react-navigation/native';
import Store from '../../../store/types';
import { useSelector } from 'react-redux';
import {
	connectToDefaultPeer,
	debugLightningStatusMessage, openMaxChannel,
} from '../../../utils/lightning';
import lnd from 'react-native-lightning';

const LightningCard = () => {
	const lightning = useSelector((state: Store) => state.lightning);
	const [message, setMessage] = useState('');
	const [receiveAddress, setReceiveAddress] = useState('');
	const navigation = useNavigation();

	LayoutAnimation.easeInEaseOut();

	const showFundingButton = lightning.onChainBalance.totalBalance === 0;
	const showSendReceive = lightning.channelBalance.balance > 0;

	//Show 'move to lightning button' if they have a confirmed on-chain balance but no channel balance
	const showOpenChannelButton =
		lightning.onChainBalance.confirmedBalance > 0 &&
		lightning.channelBalance.pendingOpenBalance === 0 &&
		lightning.channelBalance.balance === 0;

	const channelBalance = `${lightning.channelBalance.balance} sats`;
	const onChainBalance = `${lightning.onChainBalance.totalBalance} sats`;

	return (
		<AssetCard
			title="Lightning Wallet"
			description={`${debugLightningStatusMessage(lightning)}`}
			assetBalanceLabel={showSendReceive ? channelBalance : onChainBalance}
			fiatBalanceLabel="$0"
			asset="lightning">
			<>
				<View color="transparent" style={styles.buttonRow}>
					{!!showSendReceive && (
						<>
							<Button
								color="onSurface"
								style={styles.receiveButton}
								onPress={async () => {
									const res = await lnd.createInvoice(1, 'Spectrum test');
									if (res.isOk()) {
										setReceiveAddress(res.value.paymentRequest);
										console.log(res.value.paymentRequest);
									}
								}}
								onLongPress={() =>
									navigation.navigate('ReceiveAsset', {
										id: 'bitcoin',
									})
								}
								text="Receive"
							/>
						</>
					)}

					{!!showFundingButton && (
						<Button
							color="onSurface"
							style={styles.receiveButton}
							onPress={async () => {
								const res = await lnd.getAddress();
								if (res.isOk()) {
									setReceiveAddress(res.value.address);
									console.warn(res.value.address);
								}
							}}
							text="Fund"
						/>
					)}

					{!!showOpenChannelButton && (
						<Button
							color="onSurface"
							style={styles.receiveButton}
							onPress={async () => {
								setMessage('Connecting...');
								const connectRes = await connectToDefaultPeer();
								if (
									connectRes.isErr() &&
									connectRes.error.message.indexOf('already connected') === -1
								) {
									return setMessage(connectRes.error.message);
								}

								setMessage('Connected to peer.');

								const openRes = await openMaxChannel();
								if (openRes.isErr()) {
									return setMessage(openRes.error.message);
								}

								setMessage('On the way.');
							}}
							text="Move funds to lighting"
						/>
					)}
				</View>

				{!!message && <Text style={styles.message}>{message}</Text>}

				{!!receiveAddress && (
					<Receive address={receiveAddress} header={false} />
				)}
			</>
		</AssetCard>
	);
};

const styles = StyleSheet.create({
	buttonRow: {
		flexDirection: 'row',
		marginTop: 10,
	},
	sendButton: {
		flex: 1,
		marginRight: 5,
	},
	receiveButton: {
		flex: 1,
		marginLeft: 5,
	},
	message: {
		textAlign: 'center',
		marginTop: 10,
		marginBottom: 10,
	},
});

export default memo(LightningCard);
