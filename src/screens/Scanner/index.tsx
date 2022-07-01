import React, { ReactElement } from 'react';
import { View } from '../../styles/components';
import { Alert, StyleSheet } from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import Camera from '../../components/Camera';
import {
	showErrorNotification,
	showInfoNotification,
	showSuccessNotification,
} from '../../utils/notifications';
import { decodeQRData, EQRDataType, QRData } from '../../utils/scanner';
import { useSelector } from 'react-redux';
import Store from '../../store/types';
import Button from '../../components/Button';
import {
	updateOnChainTransaction,
	updateWallet,
} from '../../store/actions/wallet';
import { getMnemonicPhrase, refreshWallet } from '../../utils/wallet';
import { lnurlAuth, LNURLAuthParams } from '@synonymdev/react-native-lnurl';
import { hasEnabledAuthentication } from '../../utils/settings';
import SafeAreaView from '../../components/SafeAreaView';

const ScannerScreen = ({ navigation }): ReactElement => {
	const selectedNetwork = useSelector(
		(state: Store) => state.wallet.selectedNetwork,
	);
	const selectedWallet = useSelector(
		(state: Store) => state.wallet.selectedWallet,
	);

	const payLightningInvoicePrompt = (data: QRData): void => {
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
						//TODO: Attempt to pay lightning request.
						showInfoNotification({
							title: 'Coming soon',
							message: 'Lightning currently unsupported',
						});
					},
				},
			],
			{ cancelable: true },
		);
	};

	const handleData = async (data: QRData): Promise<void> => {
		if (data.network && data.network !== selectedNetwork) {
			return showErrorNotification(
				{
					title: 'Unsupported network',
					message: `App is currently set to ${selectedNetwork} but QR is for ${data.network}.`,
				},
				'bottom',
			);
		}

		const { qrDataType, address, sats: amount, message, network } = data;

		switch (qrDataType) {
			case EQRDataType.bitcoinAddress: {
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
			case EQRDataType.lightningPaymentRequest: {
				const { pin, biometrics } = hasEnabledAuthentication();
				if (pin || biometrics) {
					navigation.navigate('AuthCheck', {
						onSuccess: () => {
							navigation.pop();
							setTimeout(() => {
								payLightningInvoicePrompt(data);
							}, 500);
						},
					});
				} else {
					payLightningInvoicePrompt(data);
				}
				break;
			}
			case EQRDataType.lnurlAuth: {
				const getMnemonicPhraseResponse = await getMnemonicPhrase(
					selectedWallet,
				);
				if (getMnemonicPhraseResponse.isErr()) {
					return;
				}

				const authRes = await lnurlAuth({
					params: data.lnUrlParams! as LNURLAuthParams,
					network: selectedNetwork,
					bip32Mnemonic: getMnemonicPhraseResponse.value,
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
				//let params = data.lnUrlParams as LNURLWithdrawParams;
				//const sats = params.maxWithdrawable / 1000; //LNURL unit is msats
				//TODO: Create invoice
				return;
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
		<SafeAreaView>
			<Camera onBarCodeRead={onRead} onClose={(): void => {}}>
				<View color={'transparent'} style={styles.scannerView}>
					<Button
						style={styles.pasteButton}
						text={'Paste from clipboard'}
						onPress={onReadClipboard}
					/>
				</View>
			</Camera>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	scannerView: {
		flex: 1,
		justifyContent: 'flex-end',
	},
	pasteButton: {
		marginBottom: 20,
	},
});

export default ScannerScreen;
