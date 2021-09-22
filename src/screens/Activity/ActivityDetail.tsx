import React, {
	memo,
	PropsWithChildren,
	ReactElement,
	useCallback,
	useEffect,
	useMemo,
	useState,
} from 'react';
import { useSelector } from 'react-redux';
import { StyleSheet, Linking, TouchableOpacity } from 'react-native';
import { Text, View } from '../../styles/components';
import Button from '../../components/Button';
import NavigationHeader from '../../components/NavigationHeader';
import { EActivityTypes, IActivityItem } from '../../store/types/activity';
import Divider from '../../components/Divider';
import { btcToSats, truncate } from '../../utils/helpers';
import {
	adjustFee,
	broadcastBoost,
	canBoost,
	getBlockExplorerLink,
	setupBoost,
} from '../../utils/wallet/transactions';
import useDisplayValues from '../../hooks/displayValues';
import AdjustValue from '../../components/AdjustValue';
import Store from '../../store/types';
import { resetOnChainTransaction } from '../../store/actions/wallet';
import {
	showErrorNotification,
	showSuccessNotification,
} from '../../utils/notifications';

interface SectionProps extends PropsWithChildren<any> {
	title: string;
	description?: string;
	value1: string;
	value2?: string;
	handleLink?: (event) => void;
}

const Section = memo(
	({
		title,
		description,
		value1,
		value2,
		handleLink,
	}: SectionProps): ReactElement => {
		const Col2 = ({ children }): ReactElement => {
			if (handleLink) {
				return (
					<TouchableOpacity onPress={handleLink}>{children}</TouchableOpacity>
				);
			}

			return <>{children}</>;
		};

		return (
			<View style={styles.sectionContent}>
				<View style={styles.sectionColumn1}>
					<Text>{title}</Text>
					{description ? <Text>{description}</Text> : null}
				</View>

				<Col2>
					<View style={styles.sectionColumn2}>
						<Text style={handleLink ? styles.linkText : {}}>{value1}</Text>
						{value2 ? <Text>{value2}</Text> : null}
					</View>
				</Col2>
			</View>
		);
	},
);

interface Props extends PropsWithChildren<any> {
	route: { params: { activityItem: IActivityItem } };
}

const emptyActivityItem: IActivityItem = {
	id: '',
	message: '',
	address: '',
	activityType: EActivityTypes.onChain,
	txType: 'sent',
	value: 0,
	confirmed: false,
	fee: 0,
	timestamp: 0,
};

const ActivityDetail = (props: Props): ReactElement => {
	const [
		{
			id,
			message,
			address,
			activityType,
			txType,
			value,
			confirmed,
			fee: originalFee,
			timestamp,
		},
		setActivityItem,
	] = useState<IActivityItem>(
		props.route.params?.activityItem ?? emptyActivityItem,
	);
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
	const satsPerByte =
		useSelector(
			(state: Store) =>
				state.wallet.wallets[selectedWallet]?.transaction[selectedNetwork]
					?.satsPerByte,
		) ?? 1;

	const minFee =
		useSelector(
			(state: Store) =>
				state.wallet.wallets[selectedWallet]?.transaction[selectedNetwork]
					?.minFee,
		) ?? 1;

	const boostData = useMemo(() => canBoost(id), [id]);
	useEffect(() => {
		setupBoost({ selectedWallet, selectedNetwork, txid: id });

		return (): void => {
			if (boostData.canBoost && !confirmed) {
				resetOnChainTransaction({ selectedNetwork, selectedWallet });
			}
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	let status = '';
	if (value < 0) {
		if (confirmed) {
			status = 'Sent';
		} else {
			status = 'Sending...';
		}
	} else {
		if (confirmed) {
			status = 'Received';
		} else {
			status = 'Receiving...';
		}
	}

	const { bitcoinFormatted, bitcoinSymbol, fiatFormatted, fiatSymbol } =
		useDisplayValues(value);
	const feeDisplay = useDisplayValues(Number(originalFee));

	const blockExplorerUrl =
		activityType === 'onChain' ? getBlockExplorerLink(id) : '';

	const handleBlockExplorerOpen = useCallback(async () => {
		if (await Linking.canOpenURL(blockExplorerUrl)) {
			await Linking.openURL(blockExplorerUrl);
		}
	}, [blockExplorerUrl]);

	const _broadcastBoost = async (): Promise<void> => {
		try {
			const response = await broadcastBoost({
				selectedWallet,
				selectedNetwork,
				oldTxid: id,
				rbf: boostData.rbf,
			});
			if (response.isOk()) {
				showSuccessNotification({
					title: 'Boost Success',
					message: 'Successfully boosted this transaction.',
				});
				if (boostData.rbf) {
					setActivityItem(response.value);
				}
			} else {
				showErrorNotification({
					title: 'Boost Error',
					message: 'Unable to boost this transaction.',
				});
			}
		} catch (e) {
			console.log(e);
		}
	};

	const boostFee = useMemo(
		() =>
			boostData.canBoost
				? boostData.rbf
					? Math.abs(transaction.fee - (btcToSats(Number(originalFee)) ?? 0))
					: transaction.fee
				: 0,
		[boostData.canBoost, boostData.rbf, transaction.fee, originalFee],
	);

	return (
		<View style={styles.container}>
			<NavigationHeader />
			<View style={styles.content}>
				<View>
					<Text style={styles.title}>Transaction detail</Text>
					<Divider />
					<Section
						title={status}
						description={confirmed ? 'Confirmed' : 'Unconfirmed'}
						value1={new Date(timestamp).toLocaleString()}
					/>
					<Divider />
					<Section
						title={'Amount'}
						value1={`${bitcoinSymbol}${bitcoinFormatted}`}
						value2={`${fiatSymbol}${fiatFormatted}`}
					/>

					{originalFee && txType === 'sent' ? (
						<>
							<Divider />
							<Section
								title={'Fees'}
								value1={`${feeDisplay.bitcoinSymbol}${feeDisplay.bitcoinFormatted}`}
								value2={`${feeDisplay.fiatSymbol}${feeDisplay.fiatFormatted}`}
							/>
						</>
					) : null}

					{message ? (
						<>
							<Divider />
							<Section title={'Message'} value1={message} />
						</>
					) : null}

					{address ? (
						<>
							<Divider />
							<Section title={'Address'} value1={address} />
						</>
					) : null}
					{boostData.canBoost && (
						<>
							<Divider />
							<AdjustValue
								value={`${transaction.satsPerByte} sat${
									transaction?.satsPerByte > 1 ? 's' : ''
								}/B\n+${boostFee.toFixed(0)} sats`}
								decreaseValue={(): void => {
									if (satsPerByte - 1 > minFee) {
										adjustFee({
											selectedNetwork,
											selectedWallet,
											adjustBy: -1,
										});
									}
								}}
								increaseValue={(): void => {
									adjustFee({
										selectedNetwork,
										selectedWallet,
										adjustBy: 1,
									});
								}}
							/>
							<Button
								color="onSurface"
								text={'Boost'}
								onPress={_broadcastBoost}
							/>
						</>
					)}
				</View>

				<View style={styles.footer}>
					<Divider />

					<Section
						title={'Transaction ID'}
						value1={truncate(id, 16)}
						handleLink={blockExplorerUrl ? handleBlockExplorerOpen : undefined}
					/>
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
	title: {
		fontSize: 21,
	},
	sectionContent: {
		display: 'flex',
		justifyContent: 'space-between',
		flexDirection: 'row',
		minHeight: 60,
		paddingVertical: 6,
	},
	sectionColumn1: {
		flex: 4,
		display: 'flex',
		justifyContent: 'space-around',
	},
	sectionColumn2: {
		flex: 5,
		display: 'flex',
		justifyContent: 'space-around',
		alignItems: 'flex-end',
	},
	linkText: {
		color: '#2D9CDB',
	},
});

export default memo(ActivityDetail);
