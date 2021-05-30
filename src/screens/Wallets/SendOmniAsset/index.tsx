import React, {
	memo,
	ReactElement,
	useCallback,
	useEffect,
	useState,
} from 'react';
import { LayoutAnimation, StyleSheet } from 'react-native';
import { Text, TouchableOpacity, View } from '../../../styles/components';
import { useSelector } from 'react-redux';
import Store from '../../../store/types';
import AdjustValue from '../../../components/AdjustValue';
import Button from '../../../components/Button';
import { sendOmniAsset } from '../../../utils/omnibolt';
import { addOmniboltAssetData } from '../../../store/actions/omnibolt';
import { IGetProperty } from 'omnibolt-js/lib/types/types';
import {
	showErrorNotification,
	showInfoNotification,
} from '../../../utils/notifications';
import Clipboard from '@react-native-community/clipboard';
const SendOmniAsset = ({
	channelId = '',
}: {
	channelId: string;
}): ReactElement => {
	const [amount, setAmount] = useState(0); //Determines whether the user is sending the max amount.
	const [loading, setLoading] = useState(false);

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
	const assetName = asset?.name;
	const assetDescription = asset?.data;

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

	LayoutAnimation.easeInEaseOut();

	return (
		<View style={styles.container} key={channelId}>
			<View color="transparent" style={styles.row}>
				<Text>
					Asset: {assetName} ({assetId})
				</Text>
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
					style={styles.receiveButton}
					disabled={amount <= 0}
					onPress={sendAsset}
					loading={loading}
					text={`Send ${amount} ${assetName}`}
				/>
			</View>
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
	receiveButton: {
		flex: 1,
		marginLeft: 5,
	},
});

export default memo(SendOmniAsset);
