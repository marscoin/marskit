import React, {
	PropsWithChildren,
	ReactElement,
	memo,
	useCallback,
	useEffect,
	useMemo,
	useState,
} from 'react';
import { useSelector } from 'react-redux';
import { Alert, Linking, ScrollView, StyleSheet } from 'react-native';
import { Canvas, Path, Skia } from '@shopify/react-native-skia';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
	Caption13M,
	Caption13Up,
	Checkmark,
	DisplayHaas,
	Display,
	GitBranchIcon,
	LightningIcon,
	NoteIcon,
	ReceiveIcon,
	SendIcon,
	Text01M,
	Text02M,
	TitleHaas,
	UserIcon,
	View,
} from '../../styles/components';
import Button from '../../components/Button';
import NavigationHeader from '../../components/NavigationHeader';
import { EActivityTypes, IActivityItem } from '../../store/types/activity';
import {
	canBoost,
	getBlockExplorerLink,
	setupBoost,
} from '../../utils/wallet/transactions';
import useDisplayValues from '../../hooks/displayValues';
import SafeAreaView from '../../components/SafeAreaView';
import Store from '../../store/types';
import { resetOnChainTransaction } from '../../store/actions/wallet';
import useColors from '../../hooks/colors';

const SectionNew = memo(
	({ title, value }: { title?: string; value?: string }) => {
		const { gray4 } = useColors();
		return (
			<View
				color={'transparent'}
				style={[styles.sRoot, { borderBottomColor: gray4 }]}>
				<View color={'transparent'} style={styles.sText}>
					<Caption13Up color="brand">{title}</Caption13Up>
				</View>
				<View color={'transparent'} style={styles.sText}>
					<Text02M>{value}</Text02M>
				</View>
			</View>
		);
	},
);

const ZigZag = ({ color }): ReactElement => {
	const step = 12;
	let n = 0;
	const path = Skia.Path.Make();
	path.moveTo(0, 0);
	do {
		path.lineTo((n + 1) * step, step);
		path.lineTo((n + 2) * step, 0);
		n += 2;
	} while (n < 100);
	path.close();

	return <Path path={path} color={color} />;
};

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
		{ id, message, address, activityType, txType, value, confirmed, timestamp },
	] = useState<IActivityItem>(
		props.route.params?.activityItem ?? emptyActivityItem,
	);
	const { green16, gray5, background } = useColors();
	const insets = useSafeAreaInsets();
	const selectedNetwork = useSelector(
		(state: Store) => state.wallet.selectedNetwork,
	);
	const selectedWallet = useSelector(
		(state: Store) => state.wallet.selectedWallet,
	);

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

	const blockExplorerUrl =
		activityType === 'onChain' ? getBlockExplorerLink(id) : '';

	const handleBlockExplorerOpen = useCallback(async () => {
		if (await Linking.canOpenURL(blockExplorerUrl)) {
			await Linking.openURL(blockExplorerUrl);
		}
	}, [blockExplorerUrl]);

	return (
		<SafeAreaView>
			<NavigationHeader />
			<ScrollView
				contentContainerStyle={[
					styles.scrollContent,
					{ paddingBottom: insets.bottom + 80 },
				]}
				showsVerticalScrollIndicator={false}>
				<View color={'transparent'} style={styles.title}>
					<View color={'transparent'} style={styles.titleBlock}>
						<View
							color={'transparent'}
							style={[styles.iconContainer, { backgroundColor: green16 }]}>
							{txType === 'sent' ? (
								<SendIcon height={13} color="red" />
							) : (
								<ReceiveIcon height={13} color="green" />
							)}
						</View>
						<TitleHaas>{status}</TitleHaas>
					</View>

					<View color={'transparent'} style={styles.titleBlock}>
						{confirmed ? (
							<>
								<Checkmark height={14} style={styles.checkmarkIcon} />
								<Caption13M color="green"> Confirmed</Caption13M>
							</>
						) : (
							<Caption13M>Unconfirmed</Caption13M>
						)}
					</View>
				</View>

				<View color={'transparent'} style={styles.amount}>
					<Display color="gray" style={styles.bitcoinSymbol}>
						{bitcoinSymbol}
					</Display>
					<DisplayHaas>{bitcoinFormatted}</DisplayHaas>
				</View>

				<View color={'transparent'} style={styles.amountSmall}>
					<Text01M color={'gray'}>
						{fiatSymbol} {fiatFormatted}
					</Text01M>
				</View>

				<View color={'transparent'} style={styles.sectionContainer}>
					<SectionNew
						title="DATE"
						value={new Date(timestamp).toLocaleString(undefined, {
							year: 'numeric',
							month: 'long',
							day: 'numeric',
						})}
					/>
					<SectionNew
						title="TIME"
						value={new Date(timestamp).toLocaleString(undefined, {
							hour: 'numeric',
							minute: 'numeric',
							hour12: false,
						})}
					/>
				</View>

				<View color={'transparent'} style={styles.sectionContainer}>
					<SectionNew title="FROM" value="TODO" />
					<SectionNew title="TO" value={address} />
				</View>

				{message ? (
					<View color={'transparent'}>
						<Caption13M color="brand" style={styles.sText}>
							NOTE
						</Caption13M>
						<View color={'transparent'} style={{ backgroundColor: gray5 }}>
							<Canvas style={styles.zRoot}>
								<ZigZag color={background} />
							</Canvas>

							<View color={'transparent'} style={styles.note}>
								<TitleHaas>{message}</TitleHaas>
							</View>
						</View>
					</View>
				) : null}

				<View color={'transparent'} style={styles.buttonsContainer}>
					<View color={'transparent'} style={styles.sectionContainer}>
						<Button
							style={styles.button}
							text="Assign"
							icon={<UserIcon />}
							onPress={(): void => Alert.alert('TODO')}
						/>
						<Button
							style={styles.button}
							text="Explore"
							icon={<GitBranchIcon />}
							disabled={!blockExplorerUrl}
							onPress={handleBlockExplorerOpen}
						/>
					</View>
					<View color={'transparent'} style={styles.sectionContainer}>
						<Button
							style={styles.button}
							text="Label"
							icon={<NoteIcon />}
							onPress={(): void => Alert.alert('TODO')}
						/>
						<Button
							style={styles.button}
							text="Boost"
							icon={<LightningIcon color="brand" />}
							disabled={!boostData.canBoost}
							onPress={(): void => Alert.alert('TODO')}
						/>
					</View>
				</View>
			</ScrollView>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	scrollContent: {
		paddingHorizontal: 16,
	},
	title: {
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
	},
	titleBlock: {
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
	},
	iconContainer: {
		backgroundColor: 'rgba(185, 92, 232, 0.16)',
		borderRadius: 30,
		overflow: 'hidden',
		height: 32,
		width: 32,
		marginRight: 16,
		justifyContent: 'center',
		alignItems: 'center',
	},
	checkmarkIcon: {
		marginRight: 8,
	},
	amount: {
		flexDirection: 'row',
		justifyContent: 'center',
		marginTop: 32,
	},
	bitcoinSymbol: {
		fontWeight: 'bold',
	},
	amountSmall: {
		flexDirection: 'row',
		justifyContent: 'center',
		marginTop: 8,
		marginBottom: 32,
	},
	sectionContainer: {
		marginHorizontal: -4,
		flexDirection: 'row',
		justifyContent: 'space-between',
	},
	sRoot: {
		marginHorizontal: 4,
		marginBottom: 16,
		borderBottomWidth: 1,
		flex: 1,
	},
	sText: {
		marginBottom: 8,
	},
	note: {
		padding: 24,
	},
	buttonsContainer: {
		marginVertical: 10,
	},
	button: {
		marginHorizontal: 4,
		marginVertical: 4,
		flex: 1,
	},
	zRoot: {
		height: 12,
	},
});

export default memo(ActivityDetail);
