import React, {
	memo,
	ReactElement,
	useCallback,
	useEffect,
	useMemo,
	useState,
} from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSelector } from 'react-redux';

import { Caption13Up, EyeIcon } from '../styles/components';
import Store from '../store/types';
import { useBalance } from '../hooks/wallet';
import { updateSettings } from '../store/actions/settings';
import Money from './Money';
import { getClaimableBalance } from '../utils/lightning';

/**
 * Displays the total available balance for the current wallet & network.
 */
const BalanceHeader = (): ReactElement => {
	const [claimableBalance, setClaimableBalance] = useState(0);
	const selectedWallet = useSelector(
		(store: Store) => store.wallet.selectedWallet,
	);
	const selectedNetwork = useSelector(
		(store: Store) => store.wallet.selectedNetwork,
	);
	const channels = useSelector(
		(store: Store) =>
			store.lightning.nodes[selectedWallet].channels[selectedNetwork],
	);
	const openChannels = useSelector(
		(store: Store) =>
			store.lightning.nodes[selectedWallet].openChannelIds[selectedNetwork],
	);
	const balanceUnit = useSelector((store: Store) => store.settings.balanceUnit);
	const hideBalance = useSelector((state: Store) => state.settings.hideBalance);
	const { satoshis } = useBalance({
		onchain: true,
		lightning: true,
	});

	const channelsCount = useMemo(() => {
		return Object.keys(channels).length;
	}, [channels]);

	const updateClaimableBalance = useCallback(async () => {
		const _claimableBalance = await getClaimableBalance({
			selectedWallet,
			selectedNetwork,
		});
		setClaimableBalance(_claimableBalance);
	}, [selectedNetwork, selectedWallet]);

	useEffect(() => {
		updateClaimableBalance().then();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [channelsCount, openChannels.length, satoshis]);

	const handlePress = (): void => {
		// BTC -> satoshi -> fiat
		const nextUnit =
			balanceUnit === 'BTC'
				? 'satoshi'
				: balanceUnit === 'satoshi'
				? 'fiat'
				: 'BTC';
		const payload = {
			balanceUnit: nextUnit,
			...(nextUnit !== 'fiat' && { bitcoinUnit: nextUnit }),
		};
		updateSettings(payload);
	};

	const toggleHideBalance = (): void => {
		updateSettings({ hideBalance: !hideBalance });
	};

	const totalBalance = useMemo(
		() => satoshis + claimableBalance,
		[claimableBalance, satoshis],
	);

	return (
		<TouchableOpacity style={styles.container} onPress={handlePress}>
			<View style={styles.totalBalanceRow}>
				<Caption13Up color="gray1">Total balance</Caption13Up>
				{claimableBalance > 0 && (
					<>
						<Caption13Up color="gray1"> (</Caption13Up>
						<Money
							color="gray1"
							size={'caption13M'}
							sats={claimableBalance}
							unit={balanceUnit}
							enableHide={true}
							highlight={true}
							symbol={false}
						/>
						<Caption13Up color="gray1"> PENDING)</Caption13Up>
					</>
				)}
			</View>
			<View style={styles.row}>
				<View>
					<Money
						sats={totalBalance}
						unit={balanceUnit}
						enableHide={true}
						highlight={true}
						symbol={true}
					/>
				</View>
				{hideBalance && (
					<TouchableOpacity style={styles.toggle} onPress={toggleHideBalance}>
						<EyeIcon />
					</TouchableOpacity>
				)}
			</View>
		</TouchableOpacity>
	);
};

export default memo(BalanceHeader);

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'flex-start',
		marginTop: 32,
		paddingLeft: 16,
	},
	row: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		height: 41,
		marginTop: 5,
	},
	totalBalanceRow: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'flex-start',
		marginBottom: 9,
	},
	toggle: {
		paddingRight: 16,
	},
});
