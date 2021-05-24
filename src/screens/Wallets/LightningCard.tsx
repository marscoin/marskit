/**
 * @format
 * @flow strict-local
 */

import React, { memo, ReactElement, useEffect, useState } from 'react';
import { LayoutAnimation, StyleSheet } from 'react-native';
import { View, Text } from '../../styles/components';
import QR from '../../components/QR';
import Button from '../../components/Button';
import AssetCard from '../../components/AssetCard';
import Store from '../../store/types';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import {
	connectToDefaultPeer,
	debugLightningStatusMessage,
} from '../../utils/lightning';
import lnd from 'react-native-lightning';
import { showErrorNotification } from '../../utils/notifications';
import { useTranslation } from 'react-i18next';
import { getFiatBalance } from '../../utils/helpers';

const LightningCard = (): ReactElement => {
	const lightning = useSelector((state: Store) => state.lightning);
	const [message, setMessage] = useState('');
	const [displayButtonRow, setDisplayButtonRow] = useState(false);
	const [receivePaymentRequest, setReceivePaymentRequest] = useState('');
	const navigation = useNavigation();
	const { t } = useTranslation(['wallets']);

	LayoutAnimation.easeInEaseOut();

	//If user needs to wait for channel to be opened
	useEffect(() => {
		if (lightning.channelBalance.pendingOpenBalance > 0) {
			setMessage('Opening channel...');
		}
	}, [lightning.channelBalance]);

	//If the current invoice in view was just paid
	useEffect(() => {
		const currentInvoice = lightning.invoiceList.invoices.find(
			(inv) => inv.paymentRequest === receivePaymentRequest,
		);
		if (currentInvoice && currentInvoice.settled) {
			setMessage(`Invoice settled. Received ${currentInvoice.value} sats.`);
			setReceivePaymentRequest('');
		}
	}, [lightning.invoiceList, receivePaymentRequest]);

	const showSendReceive = lightning.channelBalance.balance > 0;

	//Show 'move to lightning button' if they have a confirmed on-chain balance but no channel balance
	const showOpenChannelButton =
		lightning.info.syncedToChain &&
		lightning.channelBalance.pendingOpenBalance === 0 &&
		lightning.channelBalance.balance === 0;

	const balance =
		Number(lightning.channelBalance.balance) +
		Number(lightning.channelBalance.pendingOpenBalance);

	const exchangeRate = useSelector((state: Store) => state.wallet.exchangeRate);
	const selectedCurrency = useSelector(
		(state: Store) => state.settings.selectedCurrency,
	);

	const fiatBalance = getFiatBalance({
		balance,
		exchangeRate,
		selectedCurrency,
	});

	return (
		<AssetCard
			title={t('lightning')}
			description={`${debugLightningStatusMessage(lightning)}`}
			assetBalanceLabel={`${balance} sats`}
			fiatBalanceLabel={`$${fiatBalance}`}
			asset="lightning"
			onPress={(): void => setDisplayButtonRow(!displayButtonRow)}>
			{displayButtonRow && (
				<>
					<View color="transparent" style={styles.buttonRow}>
						{!!showSendReceive && (
							<>
								<Button
									color="onSurface"
									style={styles.sendButton}
									onPress={(): void => {
										navigation.navigate('Scanner');
									}}
									text={t('common:send')}
								/>
								<Button
									color="onSurface"
									style={styles.receiveButton}
									onPress={async (): Promise<void> => {
										const res = await lnd.createInvoice(
											25,
											`Backpack test ${new Date().getTime()}`,
										);

										if (res.isErr()) {
											return showErrorNotification({
												title: 'Failed to create invoice.',
												message: res.error.message,
											});
										}

										setReceivePaymentRequest(res.value.paymentRequest);
										setMessage('');
									}}
									text={t('common:receive')}
								/>
							</>
						)}

						{showOpenChannelButton && (
							<Button
								color="onSurface"
								style={styles.fundButton}
								onPress={async (): Promise<void> => {
									connectToDefaultPeer().then();
									navigation.navigate('BitcoinToLightning');
								}}
								text="Move funds to lighting"
							/>
						)}
					</View>

					{!showSendReceive && !!message && (
						<Text style={styles.message}>{message}</Text>
					)}

					{!!receivePaymentRequest && (
						<QR data={receivePaymentRequest} header={false} />
					)}
				</>
			)}
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
	fundButton: {
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
