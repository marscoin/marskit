import React, { memo, ReactElement, useMemo, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, View } from 'react-native';
import { useSelector } from 'react-redux';

import { Subtitle, Text02S, TimerIconAlt } from '../../styles/components';
import BottomSheetWrapper from '../../components/BottomSheetWrapper';
import SwipeToConfirm from '../../components/SwipeToConfirm';
import SafeAreaInsets from '../../components/SafeAreaInsets';
import AdjustValue from '../../components/AdjustValue';
import Store from '../../store/types';
import { toggleView } from '../../store/actions/user';
import { resetOnChainTransaction } from '../../store/actions/wallet';
import {
	adjustFee,
	broadcastBoost,
	canBoost,
	setupBoost,
	validateTransaction,
} from '../../utils/wallet/transactions';
import {
	showErrorNotification,
	showSuccessNotification,
} from '../../utils/notifications';
import { btcToSats } from '../../utils/helpers';

const BoostForm = ({ activityItem }): ReactElement => {
	const selectedNetwork = useSelector(
		(state: Store) => state.wallet.selectedNetwork,
	);
	const selectedWallet = useSelector(
		(state: Store) => state.wallet.selectedWallet,
	);
	const transaction = useSelector(
		(state: Store) =>
			state.wallet.wallets[selectedWallet].transaction[selectedNetwork],
	);
	const [loading, setLoading] = useState(false);
	const [preparing, setPreparing] = useState(true);
	const boostData = useMemo(() => canBoost(activityItem.id), [activityItem.id]);

	const boostFee = useMemo(() => {
		if (!boostData.canBoost) {
			return 0;
		}
		if (!boostData.rbf) {
			return transaction.fee;
		}
		return Math.abs(
			transaction.fee - (btcToSats(Number(activityItem.fee)) ?? 0),
		);
	}, [boostData.canBoost, boostData.rbf, transaction.fee, activityItem.fee]);

	useEffect(() => {
		setupBoost({
			selectedWallet,
			selectedNetwork,
			txid: activityItem.id,
		}).then((res) => {
			setPreparing(false);
			if (res.isErr()) {
				Alert.alert(res.error.message);
				toggleView({
					view: 'boostPrompt',
					data: { isOpen: false },
				});
			}
		});

		return (): void => {
			resetOnChainTransaction({ selectedNetwork, selectedWallet });
		};
	}, [activityItem.id, selectedNetwork, selectedWallet]);

	const handleBoost = async (): Promise<void> => {
		setLoading(true);
		const transactionIsValid = validateTransaction(transaction);
		if (transactionIsValid.isErr()) {
			setLoading(false);
			Alert.alert(transactionIsValid.error.message);
			return;
		}

		try {
			const response = await broadcastBoost({
				selectedWallet,
				selectedNetwork,
				oldTxid: activityItem.id,
				rbf: boostData.rbf,
			});
			if (response.isOk()) {
				showSuccessNotification({
					title: 'Boost Success',
					message: 'Successfully boosted this transaction.',
				});
				// if (boostData.rbf) {
				// 	setActivityItem(response.value);
				// }
				toggleView({
					view: 'boostPrompt',
					data: { isOpen: false },
				});
			} else {
				showErrorNotification({
					title: 'Boost Error',
					message: 'Unable to boost this transaction.',
				});
			}
		} catch (e) {
			console.log(e);
		} finally {
			setLoading(false);
		}
	};

	if (preparing) {
		return (
			<View style={styles.preparing}>
				<ActivityIndicator />
			</View>
		);
	}

	return (
		<>
			<AdjustValue
				value={`${transaction.satsPerByte} sat${
					transaction.satsPerByte > 1 ? 's' : ''
				}/B\n+${boostFee.toFixed(0)} sats`}
				decreaseValue={(): void => {
					if (transaction.satsPerByte - 1 > transaction.minFee) {
						const res = adjustFee({
							selectedNetwork,
							selectedWallet,
							adjustBy: -1,
						});
						if (res.isErr()) {
							Alert.alert(res.error.message);
						}
					}
				}}
				increaseValue={(): void => {
					const res = adjustFee({
						selectedNetwork,
						selectedWallet,
						adjustBy: 1,
					});
					if (res.isErr()) {
						Alert.alert(res.error.message);
					}
				}}
			/>

			<View style={styles.nextButtonContainer}>
				<SwipeToConfirm
					text="Swipe To Boost"
					color="yellow"
					onConfirm={handleBoost}
					icon={<TimerIconAlt width={30} height={30} color="black" />}
					loading={loading}
					confirmed={loading}
				/>
			</View>
		</>
	);
};

const BoostPrompt = (): ReactElement => {
	const snapPoints = useMemo(() => [400], []);
	const activityItem = useSelector(
		(store: Store) => store.user.viewController?.boostPrompt?.activityItem,
	);
	const isOpen = useSelector(
		(store: Store) => store.user.viewController?.boostPrompt?.isOpen,
	);

	const handleClose = (): void => {
		toggleView({
			view: 'boostPrompt',
			data: { isOpen: false },
		});
	};

	return (
		<BottomSheetWrapper
			snapPoints={snapPoints}
			backdrop={true}
			onClose={handleClose}
			view="boostPrompt">
			<View style={styles.root}>
				<Subtitle style={styles.title}>Boost transaction</Subtitle>
				<Text02S color="gray1">
					Your transaction may settle faster if you include an additional
					network fee. Here is a recommendation:
				</Text02S>

				{isOpen && activityItem && (
					<BoostForm key={activityItem.id} activityItem={activityItem} />
				)}

				<SafeAreaInsets type="bottom" />
			</View>
		</BottomSheetWrapper>
	);
};

const styles = StyleSheet.create({
	root: {
		alignItems: 'center',
		flex: 1,
		paddingHorizontal: 32,
	},
	title: {
		marginBottom: 25,
	},
	nextButtonContainer: {
		flex: 1,
		paddingHorizontal: 16,
		justifyContent: 'flex-end',
		alignSelf: 'stretch',
	},
	preparing: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
});

export default memo(BoostPrompt);
