/**
 * @format
 * @flow strict-local
 */

import React, { memo, ReactElement } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import RadialGradient from 'react-native-radial-gradient';
import {
	Caption13M,
	Caption13S,
	Text01M,
	View,
	TransferIcon,
	Text02S,
	BitcoinIcon,
	LightningIcon,
} from '../../../styles/components';
import { useBalance } from '../../../hooks/wallet';
import { IDisplayValues } from '../../../utils/exchange-rate';
import { useSelector } from 'react-redux';
import Store from '../../../store/types';
import themes from '../../../styles/themes';

const NetworkRow = ({
	title,
	color,
	icon,
	values,
}: {
	title: string;
	color: string;
	icon: ReactElement;
	values: IDisplayValues;
}): ReactElement => {
	const theme = useSelector((state: Store) => state.settings.theme);
	const { colors } = themes[theme];

	return (
		<View color={'transparent'} style={styles.networkRow}>
			<View color={'transparent'} style={styles.titleContainer}>
				<View style={styles.networkIconContainer}>
					<RadialGradient
						style={styles.networkIconRadialGradient}
						colors={[color, colors.gray6]}
						stops={[0, 0.55]}
						center={[0, 0]}
						radius={90}>
						{icon}
					</RadialGradient>
				</View>

				<Text02S>{title}</Text02S>
			</View>
			<View color={'transparent'} style={styles.valueContainer}>
				<Text01M style={styles.value}>
					{values.bitcoinSymbol} {values.bitcoinFormatted}
				</Text01M>
				<Caption13S color={'gray'} style={styles.value}>
					{values.fiatFormatted} {values.fiatTicker}
				</Caption13S>
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
				title={'Bitcoin Network'}
				color={'#B26200'}
				icon={<BitcoinIcon />}
				values={onchainBalance}
			/>
			<View color={'transparent'} style={styles.transferRow}>
				<View color={'onSurface'} style={styles.line} />
				<TouchableOpacity>
					<View style={styles.transferButton} color={'surface'}>
						<TransferIcon />
						<Caption13M color={'white'} style={styles.transferButtonText}>
							Transfer
						</Caption13M>
					</View>
				</TouchableOpacity>
				<View color={'onSurface'} style={styles.line} />
			</View>
			<NetworkRow
				title={'Lightning Network'}
				color={'#9400DF'}
				icon={<LightningIcon />}
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
		paddingVertical: 18.3,
	},
	line: {
		flex: 1,
		height: 1,
	},
	networkIconContainer: {
		backgroundColor: 'green',
		borderRadius: 30,
		overflow: 'hidden',
		height: 40,
		width: 40,
		marginRight: 14,
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
	},
	networkIconRadialGradient: {
		padding: 12,
	},
	transferButton: {
		paddingHorizontal: 12.28,
		height: 30,
		borderRadius: 34,
		display: 'flex',
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
	},
	transferButtonText: {
		paddingLeft: 12.28,
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
