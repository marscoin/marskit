import React, {
	memo,
	ReactElement,
	useCallback,
	useEffect,
	useState,
} from 'react';
import { LayoutAnimation, Linking, StyleSheet } from 'react-native';
import { Text, TouchableOpacity, View } from '../../../styles/components';
import { useSelector } from 'react-redux';
import Store from '../../../store/types';
import AdjustValue from '../../../components/AdjustValue';
import Button from '../../../components/Button';
import {
	closeChannel,
	getOmniboltUserData,
	sendOmniAsset,
} from '../../../utils/omnibolt';
import {
	addOmniboltAssetData,
	updateOmniboltChannels,
} from '../../../store/actions/omnibolt';
import { IGetProperty } from 'omnibolt-js/lib/types/types';
import {
	showErrorNotification,
	showInfoNotification,
	showSuccessNotification,
} from '../../../utils/notifications';
import Clipboard from '@react-native-community/clipboard';
import { hasEnabledAuthentication } from '../../../utils/settings';
import { useNavigation } from '@react-navigation/native';
import { getStore } from '../../../store/helpers';
import {
	broadcastTransaction,
	getBlockExplorerLink,
} from '../../../utils/wallet/transactions';

const OmniboltChannelCard = ({
	channelId = '',
}: {
	channelId: string;
}): ReactElement => {
	const [amount, setAmount] = useState(0); //Determines whether the user is sending the max amount.
	const [loading, setLoading] = useState(false);

	const navigation = useNavigation();

	const selectedWallet = useSelector(
		(store: Store) => store.wallet.selectedWallet,
	);
	const selectedNetwork = useSelector(
		(store: Store) => store.wallet.selectedNetwork,
	);

	const channel = useSelector(
		(state: Store) =>
			state.omnibolt.wallets[selectedWallet].channels[selectedNetwork][
				channelId
			],
	);

	const signingData = useSelector(
		(state: Store) =>
			state.omnibolt.wallets[selectedWallet].signingData[selectedNetwork][
				channelId
			],
	);

	const assetData = useSelector((state: Store) => state.omnibolt?.assetData);

	const getAssetData = useCallback((): IGetProperty | undefined => {
		try {
			let data;
			try {
				data = assetData[channel.property_id];
			} catch {}
			return data;
		} catch (e) {
			return undefined;
		}
	}, [assetData, channel.property_id]);
	const asset = getAssetData();

	useEffect(() => {
		let data;
		try {
			data = assetData[channel.property_id];
		} catch {}
		//If there's no data on the provided property id, fetch, save and display it.
		if (!data) {
			addOmniboltAssetData(channel.property_id).then();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const channelBalance = channel.asset_amount;
	const myBalance = channel.balance_a;
	let peerBalance = channel.balance_b;
	const assetId = channel.property_id;
	const fundingAddress = signingData?.fundingAddress?.address || ' ';
	const assetName = asset?.name;
	const assetDescription = asset?.data;
	const isClosed = channel.curr_state === 21;

	useEffect(() => {
		if (myBalance < amount) {
			setAmount(myBalance);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [myBalance]);

	//If no balance is reflected for either participant, the channel balance resides with the peer.
	if (myBalance === 0 && peerBalance === 0) {
		peerBalance = channelBalance;
	}

	const authCheck = (): void => {
		const { pin, biometrics } = hasEnabledAuthentication();
		if (pin || biometrics) {
			navigation.navigate('AuthCheck', {
				onSuccess: () => {
					// @ts-ignore
					navigation.pop();
					setTimeout(() => {
						sendAsset().then();
					}, 500);
				},
			});
		} else {
			sendAsset().then();
		}
	};

	const sendAsset = async (): Promise<void> => {
		setLoading(true);
		const response = await sendOmniAsset({
			channelId,
			amount,
		});
		if (response.isErr()) {
			setLoading(false);
			showErrorNotification({
				title: 'Error: Peer is offline.',
				message: '',
			});
			return;
		}
		//TODO: Add listener to handle the completion of a successful or unsuccessful transfer.
		setTimeout(() => {
			setLoading(false);
		}, 4000);
	};

	const _closeChannel = async (): Promise<void> => {
		try {
			const userData = getOmniboltUserData({});
			if (userData.isErr()) {
				showErrorNotification({
					title: 'Unable to retrieve Omnibolt user data.',
					message: '',
				});
				return;
			}
			const {
				nodePeerId: recipient_node_peer_id,
				userPeerId: recipient_user_peer_id,
			} = userData.value;
			const closeResponse = await closeChannel({
				recipient_node_peer_id,
				recipient_user_peer_id,
				channelId: channel.channel_id,
			});
			if (closeResponse.isOk()) {
				showSuccessNotification({
					title: 'Channel Closed Successfully',
					message: channel.channel_id,
				});
				updateOmniboltChannels({}).then();
			}
		} catch (e) {
			showErrorNotification({
				title: 'Error Closing Channel',
				message: e,
			});
			console.log(e);
		}
	};

	const forceCloseChannel = async (): Promise<void> => {
		try {
			const rawTx =
				getStore().omnibolt.wallets[selectedWallet].signingData[
					selectedNetwork
				][channelId].kTbSignedHexCR110351;
			const broadcastResponse = await broadcastTransaction({
				rawTx,
				selectedNetwork,
			});
			if (broadcastResponse.isErr()) {
				showErrorNotification({
					title: 'Error Force Closing Channel',
					message: broadcastResponse.error.message,
				});
				return;
			}
			showSuccessNotification({
				title: 'Channel Force Closed Successfully',
				message: channel.channel_id,
			});
			updateOmniboltChannels({}).then();
		} catch (e) {
			console.log(e);
			showErrorNotification({
				title: 'Error Force Closing Channel',
				message: e,
			});
		}
	};

	LayoutAnimation.easeInEaseOut();

	return (
		<View style={styles.container} key={channelId}>
			<View color="transparent" style={styles.row}>
				<Text>
					Asset: {assetName} ({assetId})
				</Text>
			</View>
			<View color="transparent" style={styles.row}>
				<Text>Status: {isClosed ? 'Closed' : 'Open'}</Text>
			</View>
			<View color="transparent" style={styles.row}>
				<Text>Description: {assetDescription}</Text>
			</View>
			<View color="transparent" style={styles.row}>
				<Text>My Balance: {myBalance}</Text>
			</View>
			<View color="transparent" style={styles.row}>
				<Text>Peer Balance: {peerBalance}</Text>
			</View>
			<View color="transparent" style={styles.row}>
				<Text>Channel Balance: {channelBalance}</Text>
			</View>
			<TouchableOpacity
				activeOpacity={0.6}
				onPress={(): void => {
					Clipboard.setString(channelId);
					showInfoNotification({
						title: 'Copied Channel ID',
						message: channelId,
					});
				}}
				color="transparent"
				style={styles.row}>
				<Text>Channel ID: {channelId}</Text>
			</TouchableOpacity>
			{fundingAddress && (
				<TouchableOpacity
					activeOpacity={0.6}
					onPress={(): void => {
						Linking.openURL(
							getBlockExplorerLink(fundingAddress, 'address', selectedNetwork),
						);
					}}
					color="transparent"
					style={styles.row}>
					<Text>Funding Address: {fundingAddress}</Text>
				</TouchableOpacity>
			)}
			{myBalance > 0 && !isClosed && (
				<>
					<AdjustValue
						value={`${amount} ${assetName}`}
						decreaseValue={(): void => {
							const newAmount = amount - 1;
							if (newAmount >= 0) {
								setAmount(newAmount);
							}
						}}
						increaseValue={(): void => {
							const newAmount = amount + 1;
							if (myBalance >= newAmount) {
								setAmount(newAmount);
							}
						}}
					/>
					<View color="transparent" style={styles.row}>
						<Button
							color="onSurface"
							style={styles.button}
							disabled={amount <= 0}
							onPress={authCheck}
							loading={loading}
							text={`Send ${amount} ${assetName}`}
						/>
					</View>
				</>
			)}
			{!isClosed && (
				<>
					<View color="transparent" style={styles.row}>
						<Button
							color="onSurface"
							style={styles.button}
							onPress={_closeChannel}
							text={'Close Channel'}
						/>
					</View>
					{myBalance > 0 && (
						<View color="transparent" style={styles.row}>
							<Button
								color="onSurface"
								style={styles.button}
								onPress={forceCloseChannel}
								text={'Force Close Channel'}
							/>
						</View>
					)}
				</>
			)}
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		padding: 15,
		borderRadius: 20,
	},
	row: {
		flexDirection: 'row',
		marginVertical: 5,
	},
	button: {
		flex: 1,
	},
});

export default memo(OmniboltChannelCard);
