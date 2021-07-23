import React, { PropsWithChildren, ReactElement, useState } from 'react';
import { StyleSheet } from 'react-native';
import { Text, TextInput, View } from '../../styles/components';
import NavigationHeader from '../../components/NavigationHeader';
import Divider from '../../components/Divider';
import useDisplayValues from '../../utils/exchange-rate/useDisplayValues';
import { IBuyChannelResponse, IService } from '../../utils/chainreactor/types';
import Button from '../../components/Button';
import { buyChannel } from '../../store/actions/chainreactor';
import {
	showErrorNotification,
	showSuccessNotification,
} from '../../utils/notifications';
import lnd from '@synonymdev/react-native-lightning';
import { lnrpc } from '@synonymdev/react-native-lightning/dist/protos/rpc';
import { payLightningRequest } from '../../store/actions/lightning';

interface Props extends PropsWithChildren<any> {
	route: { params: { service: IService } };
	navigation: any;
}

const Order = (props: Props): ReactElement => {
	const {
		service: {
			product_id,
			product_name,
			min_channel_size,
			max_channel_size,
			max_chan_expiry,
		},
	} = props.route.params;
	const { navigation } = props;

	const [isProcessing, setIsProcessing] = useState(false);
	const [orderDetails, setOrderDetails] =
		useState<IBuyChannelResponse | undefined>(undefined);

	const [payRequest, setPayRequest] =
		useState<lnrpc.PayReq | undefined>(undefined);

	const [remoteBalance, setRemoteBalance] = useState('0');
	const [localBalance, setLocalBalance] = useState(`${min_channel_size}`);

	const minChannelSizeDisplay = useDisplayValues(min_channel_size);
	const maxChannelSizeDisplay = useDisplayValues(max_channel_size);

	const priceDisplayValue = useDisplayValues(
		orderDetails ? orderDetails.price : 0,
	);

	const payRequestDisplayValue = useDisplayValues(
		payRequest ? Number(payRequest.numSatoshis) : 0,
	);

	const onOrder = async (): Promise<void> => {
		setIsProcessing(true);
		const res = await buyChannel({
			product_id,
			channel_expiry: max_chan_expiry,
			remote_balance: Number(remoteBalance),
			local_balance: Number(localBalance),
		});

		if (res.isErr()) {
			setIsProcessing(false);
			return showErrorNotification({
				title: 'Order failed',
				message: res.error.message,
			});
		}

		const lightningRes = await lnd.decodeInvoice(res.value.ln_invoice);

		if (lightningRes.isErr()) {
			setIsProcessing(false);
			return showErrorNotification({
				title: 'Failed to decode invoice',
				message: lightningRes.error.message,
			});
		}

		setPayRequest(lightningRes.value);
		setOrderDetails(res.value);
		setIsProcessing(false);
	};

	const onPay = async (): Promise<void> => {
		setIsProcessing(true);

		const payRes = await payLightningRequest(orderDetails?.ln_invoice || '');
		if (payRes.isErr()) {
			setIsProcessing(false);
			return showErrorNotification({
				title: 'Failed to pay invoice',
				message: payRes.error.message,
			});
		}

		showSuccessNotification({ title: 'Invoice paid', message: '' });
		setIsProcessing(false);
		navigation.goBack();
	};

	return (
		<View style={styles.container}>
			<NavigationHeader title={product_name} />
			<View style={styles.content}>
				{orderDetails && payRequest ? (
					<View>
						<Text>Order: {orderDetails.order_id}</Text>
						<Text>
							Price:
							{priceDisplayValue.bitcoinSymbol}
							{priceDisplayValue.bitcoinFormatted} (
							{priceDisplayValue.fiatSymbol}
							{priceDisplayValue.fiatFormatted})
						</Text>

						<Text>
							Invoice amount:
							{payRequestDisplayValue.bitcoinSymbol}
							{payRequestDisplayValue.bitcoinFormatted} (
							{payRequestDisplayValue.fiatSymbol}
							{payRequestDisplayValue.fiatFormatted})
						</Text>

						<Text>Note: {payRequest.description}</Text>
					</View>
				) : (
					<View>
						<Text style={styles.price}>
							Min channel size: {minChannelSizeDisplay.bitcoinSymbol}
							{minChannelSizeDisplay.bitcoinFormatted} (
							{minChannelSizeDisplay.fiatSymbol}
							{minChannelSizeDisplay.fiatFormatted})
						</Text>

						<Text style={styles.price}>
							Max channel size: {maxChannelSizeDisplay.bitcoinSymbol}
							{maxChannelSizeDisplay.bitcoinFormatted} (
							{maxChannelSizeDisplay.fiatSymbol}
							{maxChannelSizeDisplay.fiatFormatted})
						</Text>
						<Divider />

						<Text>Can receive</Text>
						<TextInput
							textAlignVertical={'center'}
							underlineColorAndroid="transparent"
							style={styles.textInput}
							placeholder="Can receive"
							autoCapitalize="none"
							autoCompleteType="off"
							keyboardType="number-pad"
							autoCorrect={false}
							onChangeText={setLocalBalance}
							value={localBalance}
						/>

						<Text>Can send</Text>
						<TextInput
							textAlignVertical={'center'}
							underlineColorAndroid="transparent"
							style={styles.textInput}
							placeholder="Can send"
							autoCapitalize="none"
							autoCompleteType="off"
							keyboardType="number-pad"
							autoCorrect={false}
							onChangeText={setRemoteBalance}
							value={remoteBalance}
						/>
					</View>
				)}

				<View style={styles.footer}>
					<Divider />

					{orderDetails ? (
						<Button
							text={isProcessing ? 'Paying...' : 'Pay'}
							disabled={isProcessing}
							onPress={onPay}
						/>
					) : (
						<Button
							text={isProcessing ? 'Ordering...' : 'Order'}
							disabled={isProcessing}
							onPress={onOrder}
						/>
					)}
				</View>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	content: {
		paddingLeft: 20,
		paddingRight: 20,
		flex: 1,
		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'space-between',
	},
	footer: {
		paddingBottom: 20,
	},
	price: {
		marginVertical: 10,
		fontSize: 14,
	},
	textInput: {
		minHeight: 50,
		borderRadius: 5,
		fontWeight: 'bold',
		fontSize: 18,
		textAlign: 'center',
		color: 'gray',
		borderBottomWidth: 1,
		borderColor: 'gray',
		paddingHorizontal: 10,
		backgroundColor: 'white',
		marginVertical: 5,
	},
});

export default Order;
