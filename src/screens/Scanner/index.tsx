import React, { ReactElement } from 'react';
import { View } from '../../styles/components';
import { Alert, StyleSheet } from 'react-native';
import Clipboard from '@react-native-community/clipboard';
import Camera from '../../components/Camera';
import {
	showErrorNotification,
	showInfoNotification,
	showSuccessNotification,
} from '../../utils/notifications';
import { decodeQRData, EQRDataType, QRData } from '../../utils/scanner';
import { useSelector } from 'react-redux';
import Store from '../../store/types';
import { payLightningRequest } from '../../store/actions/lightning';
import Button from '../../components/Button';
import {
	updateOnChainTransaction,
	updateWallet,
} from '../../store/actions/wallet';
import { getMnemonicPhrase, refreshWallet } from '../../utils/wallet';
import { updateOmniboltConnectData } from '../../store/actions/omnibolt';
import {
	lnurlAuth,
	LNURLAuthParams,
	lnurlWithdraw,
} from '@synonymdev/react-native-lnurl';
import lnd from '@synonymdev/react-native-lightning';
import { LNURLWithdrawParams } from 'js-lnurl';

const ScannerScreen = ({ navigation }): ReactElement => {
	const selectedNetwork = useSelector(
		(state: Store) => state.wallet.selectedNetwork,
	);
	const selectedWallet = useSelector(
		(state: Store) => state.wallet.selectedWallet,
	);

	const handleData = async (data: QRData): Promise<void> => {
		if (data.network !== selectedNetwork) {
			return showErrorNotification(
				{
					title: 'Unsupported network',
					message: `App is currently set to ${selectedNetwork} but QR is for ${data.network}.`,
				},
				'bottom',
			);
		}

		switch (data.qrDataType) {
			case EQRDataType.bitcoinAddress: {
				const { address, sats: amount, message, network } = data;
				updateOnChainTransaction({
					selectedWallet,
					selectedNetwork,
					transaction: {
						label: message,
						outputs: [{ address, value: amount }],
					},
				}).then();
				//Switch networks if necessary.
				if (network !== selectedNetwork) {
					await updateWallet({ selectedNetwork: network });
				}
				refreshWallet().then();
				break;
			}
			case EQRDataType.omniboltConnect: {
				updateOmniboltConnectData({
					data,
					selectedNetwork,
					selectedWallet,
				});
				break;
			}
			case EQRDataType.lightningPaymentRequest: {
				Alert.alert(
					`Pay ${data.sats} sats?`,
					data.message,
					[
						{
							text: 'Cancel',
							onPress: (): void => {},
							style: 'cancel',
						},
						{
							text: 'Pay',
							onPress: async (): Promise<void> => {
								const payRes = await payLightningRequest(
									data.lightningPaymentRequest ?? '',
								);
								if (payRes.isErr()) {
									showErrorNotification({
										title: 'Payment failed',
										message: payRes.error.message,
									});
									return;
								}

								showSuccessNotification({
									title: 'Paid!',
									message: `${data.sats} sats`,
								});
							},
						},
					],
					{ cancelable: true },
				);

				break;
			}
			case EQRDataType.lnurlAuth: {
				const getMnemonicPhraseResponse = await getMnemonicPhrase(
					selectedWallet,
				);

				const authRes = await lnurlAuth({
					params: data.lnUrlParams! as LNURLAuthParams,
					network: selectedNetwork,
					bip32Mnemonic: getMnemonicPhraseResponse.data,
				});
				if (authRes.isErr()) {
					showErrorNotification({
						title: 'LNURL-Auth failed',
						message: authRes.error.message,
					});
					return;
				}

				showSuccessNotification({
					title: 'Authenticated!',
					message: '',
				});

				break;
			}
			case EQRDataType.lnurlWithdraw: {
				let params = data.lnUrlParams as LNURLWithdrawParams;
				const sats = params.maxWithdrawable / 1000; //LNURL unit is msats

				const invRes = await lnd.createInvoice(sats, params.defaultDescription);
				if (invRes.isErr()) {
					showErrorNotification({
						title: 'LNURL-Withdraw failed generating invoice',
						message: invRes.error.message,
					});
					return;
				}

				let withdrawRes = await lnurlWithdraw(
					params,
					invRes.value.paymentRequest,
				);
				if (withdrawRes.isErr()) {
					showErrorNotification({
						title: 'LNURL-Withdraw failed',
						message: withdrawRes.error.message,
					});

					console.log(`Tried to withdraw ${sats} sats`);
					return;
				}

				showSuccessNotification({
					title: 'Success!',
					message: `Withdrew ${sats} sats from ${params.domain}`,
				});

				break;
			}
		}
	};

	const onRead = async (data): Promise<void> => {
		const res = await decodeQRData(data);

		if (res.isErr() || (res.isOk() && res.value.length === 0)) {
			showErrorNotification(
				{
					title: 'Error',
					message: 'Failed to detect any readable data',
				},
				'bottom',
			);
			return;
		}

		navigation.pop();

		const qrData = res.value;
		if (qrData.length === 1) {
			return await handleData(qrData[0]);
		} else {
			//Multiple payment requests, like bitcoin and lightning in on QR. Show them the options they have and then handle the selected one.
			Alert.alert('How would you like to pay?', '', [
				{
					text: 'Cancel',
					onPress: (): void => {},
					style: 'cancel',
				},
				...qrData.map((selectedOption) => ({
					text: selectedOption.qrDataType,
					onPress: async (): Promise<void> => await handleData(selectedOption),
				})),
			]);
		}
	};

	const onReadClipboard = async (): Promise<void> => {
		const data = await Clipboard.getString();
		if (!data) {
			return showInfoNotification(
				{
					title: 'Clipboard empty',
					message: 'Nothing available to paste',
				},
				'bottom',
			);
		}

		await onRead(data);
	};

	return (
		<View style={styles.container}>
			<Camera onBarCodeRead={onRead} onClose={(): void => {}}>
				<View color={'transparent'} style={styles.scannerView}>
					<Button
						style={styles.pasteButton}
						text={'Paste from clipboard'}
						onPress={onReadClipboard}
					/>
				</View>
			</Camera>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	scannerView: {
		flex: 1,
		justifyContent: 'flex-end',
	},
	pasteButton: {
		marginBottom: 20,
	},
});

export default ScannerScreen;
