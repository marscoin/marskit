import React, { memo, ReactElement, useCallback, useState } from 'react';
import { LayoutAnimation, StyleSheet } from 'react-native';
import { View } from '../../styles/components';
import QR from '../../components/QR';
import Button from '../../components/Button';
import AssetCard from '../../components/AssetCard';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import Store from '../../store/types';
import { getNetworkData } from '../../utils/helpers';
import { default as bitcoinUnits } from 'bitcoin-units';
import SendOnChainTransaction from './SendOnChainTransaction';
import { resetOnChainTransaction } from '../../store/actions/wallet';
import { refreshWallet } from '../../utils/wallet';
import useDisplayValues from '../../utils/exchange-rate/useDisplayValues';

const BitcoinCard = (): ReactElement => {
	const [displaySend, setDisplaySend] = useState(false);
	const [displayReceive, setDisplayReceive] = useState(false);
	const [displayButtonRow, setDisplayButtonRow] = useState(false);

	const navigation = useNavigation();

	const selectedNetwork = useSelector(
		(state: Store) => state.wallet.selectedNetwork,
	);
	const selectedWallet = useSelector(
		(state: Store) => state.wallet.selectedWallet,
	);

	const outputs = useSelector(
		(state: Store) =>
			state.wallet?.wallets[selectedWallet]?.transaction[selectedNetwork]
				?.outputs || [],
	);
	const addressIndex = useSelector(
		(state: Store) => state.wallet?.wallets[selectedWallet]?.addressIndex,
	);
	const bitcoinUnit = useSelector((state: Store) => state.settings.bitcoinUnit);

	const networkData = getNetworkData({ bitcoinUnit, selectedNetwork });

	let balance = useSelector((state: Store) => {
		try {
			return state.wallet.wallets[selectedWallet].balance[selectedNetwork];
		} catch {
			return 0;
		}
	});

	const { bitcoinFormatted, bitcoinSymbol, fiatFormatted, fiatSymbol } =
		useDisplayValues(balance);

	const getReceiveAddress = useCallback((): string => {
		try {
			return addressIndex[selectedNetwork].address || ' ';
		} catch {
			return ' ';
		}
	}, [addressIndex, selectedNetwork]);
	const receiveAddress = getReceiveAddress();
	balance = bitcoinUnits(balance, 'satoshi').to(bitcoinUnit).value();

	LayoutAnimation.easeInEaseOut();

	const hasOutputs = useCallback((): boolean => {
		try {
			return outputs.length > 0 && outputs[0]?.address;
		} catch {
			return false;
		}
	}, [outputs]);

	const toggleSendTransaction = async (): Promise<void> => {
		if (hasOutputs() && displaySend) {
			resetOnChainTransaction({
				selectedWallet,
				selectedNetwork,
			});
		}
		setDisplaySend(!displaySend);
		if (displayReceive) {
			setDisplayReceive(false);
		}
	};

	const toggleReceiveTransaction = async (): Promise<void> => {
		if (displaySend) {
			setDisplaySend(false);
		}
		setDisplayReceive(!displayReceive);
	};

	const shouldDisplayButtons = (): boolean => {
		try {
			return displayButtonRow || hasOutputs();
		} catch {
			return false;
		}
	};

	const shouldDisplaySendButton = (): boolean => {
		try {
			return displaySend || hasOutputs();
		} catch {
			return false;
		}
	};

	const toggleCard = (): void => {
		if (shouldDisplaySendButton()) {
			toggleSendTransaction().then();
			return;
		}
		if (displayReceive) {
			toggleReceiveTransaction().then();
			return;
		}
		setDisplayButtonRow(!displayButtonRow);
	};

	return (
		<AssetCard
			title={`${networkData.label} Wallet`}
			assetBalanceLabel={`${bitcoinSymbol}${bitcoinFormatted}`}
			fiatBalanceLabel={`${fiatSymbol}${fiatFormatted}`}
			asset="bitcoin"
			onPress={toggleCard}>
			{!!shouldDisplayButtons() && (
				<>
					<View color="transparent" style={styles.buttonRow}>
						<Button
							color="onSurface"
							style={styles.sendButton}
							onPress={toggleSendTransaction}
							onLongPress={(): void =>
								navigation.navigate('SendOnChainTransaction', {
									id: selectedNetwork,
								})
							}
							text={'Send'}
						/>
						<Button
							color="onSurface"
							style={styles.receiveButton}
							onPress={toggleReceiveTransaction}
							onLongPress={(): void =>
								navigation.navigate('QR', {
									data: receiveAddress,
									headerTitle: 'Receive',
								})
							}
							text={'Receive'}
						/>
					</View>
					{!!shouldDisplaySendButton() && (
						<SendOnChainTransaction
							header={false}
							onComplete={(): void => {
								toggleSendTransaction().then();
								resetOnChainTransaction({
									selectedWallet,
									selectedNetwork,
								});
								setTimeout(() => {
									refreshWallet().then();
								}, 4000);
							}}
						/>
					)}
					{!!displayReceive && <QR data={receiveAddress} header={false} />}
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
});

export default memo(BitcoinCard);
