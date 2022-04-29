import React, { memo, ReactElement } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import {
	Caption13M,
	Text01M,
	View,
	TransferIcon,
	LightningIcon,
	CoinsIcon,
} from '../../../styles/components';
import { useBalance } from '../../../hooks/wallet';
import { IDisplayValues } from '../../../utils/exchange-rate/types';

const NetworkRow = ({
	title,
	subtitle,
	color,
	icon,
	values,
}: {
	title: string;
	subtitle: string;
	color: string;
	icon: ReactElement;
	values: IDisplayValues;
}): ReactElement => {
	return (
		<View color={'transparent'} style={styles.networkRow}>
			<View color={'transparent'} style={styles.titleContainer}>
				<View style={[styles.networkIconContainer, { backgroundColor: color }]}>
					{icon}
				</View>
				<View color={'transparent'}>
					<Text01M>{title}</Text01M>
					<Caption13M color={'gray1'}>{subtitle}</Caption13M>
				</View>
			</View>
			<View color={'transparent'} style={styles.valueContainer}>
				<Text01M style={styles.value}>
					<Text01M color={'gray1'}>{values.bitcoinSymbol} </Text01M>
					{values.bitcoinFormatted}
				</Text01M>
				<Caption13M color={'gray1'} style={styles.value}>
					{values.fiatFormatted} {values.fiatTicker}
				</Caption13M>
			</View>
		</View>
	);
};

const BitcoinBreakdown = (): ReactElement => {
	const onchainBalance = useBalance({ onchain: true });
	const lightningBalance = useBalance({ lightning: true });

	return (
		<View color={'transparent'} style={styles.container}>
			<NetworkRow
				title={'Bitcoin savings'}
				subtitle={'On-chain BTC'}
				color={'rgba(247, 147, 26, 0.16)'}
				icon={<CoinsIcon />}
				values={onchainBalance}
			/>
			<View color={'transparent'} style={styles.transferRow}>
				<View color={'gray4'} style={styles.line} />
				<TouchableOpacity>
					<View style={styles.transferButton} color={'white08'}>
						<TransferIcon height={13} color={'white'} />
						<Caption13M color={'white'} style={styles.transferButtonText}>
							Transfer
						</Caption13M>
					</View>
				</TouchableOpacity>
				<View color={'gray4'} style={styles.line} />
			</View>
			<NetworkRow
				title={'Spending balance'}
				subtitle={'Lightning Network BTC'}
				color={'rgba(185, 92, 232, 0.16)'}
				icon={<LightningIcon height={15} />}
				values={lightningBalance}
			/>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		display: 'flex',
	},
	networkRow: {
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
	},
	transferRow: {
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
		paddingVertical: 16,
	},
	line: {
		flex: 1,
		height: 1,
	},
	networkIconContainer: {
		backgroundColor: 'rgba(185, 92, 232, 0.16)',
		borderRadius: 30,
		overflow: 'hidden',
		height: 32,
		width: 32,
		marginRight: 14,
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
	},
	transferButton: {
		paddingHorizontal: 15,
		height: 36,
		borderRadius: 34,
		display: 'flex',
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
		marginHorizontal: 16,
	},
	transferButtonText: {
		paddingLeft: 10,
	},
	titleContainer: {
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
	},
	valueContainer: {
		display: 'flex',
		alignItems: 'flex-end',
	},
	value: {
		textAlign: 'right',
	},
});

export default memo(BitcoinBreakdown);
