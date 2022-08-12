import React, { ReactElement, memo, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { DownArrow, UpArrow, View as ThemedView } from '../styles/components';
import Money from './Money';

const LightningChannel = ({
	spendingTotal,
	spendingAvailable,
	spendingSize = 16,
	receivingTotal,
	receivingAvailable,
	receivingSize = 16,
	disabled = false,
}: {
	spendingTotal: number;
	spendingAvailable: number;
	spendingSize?: number;
	receivingTotal: number;
	receivingAvailable: number;
	receivingSize?: number;
	disabled?: boolean;
}): ReactElement => {
	const spendingWidth = `${100 * (spendingAvailable / spendingTotal)}%`;
	const receivingWidth = `${100 * (receivingAvailable / receivingTotal)}%`;

	const spendingTotalStyle = useMemo(
		() => [
			styles.bar,
			{
				justifyContent: 'flex-end',
				borderTopLeftRadius: spendingSize,
				borderBottomLeftRadius: spendingSize,
				marginRight: 1,
			},
		],
		[spendingSize],
	);
	const spendingAvailableStyle = useMemo(
		() => ({
			width: spendingWidth,
			height: spendingSize,
			borderTopLeftRadius: spendingSize,
			borderBottomLeftRadius: spendingSize,
		}),
		[spendingSize, spendingWidth],
	);

	const receivingTotalStyle = useMemo(
		() => [
			styles.bar,
			{
				borderTopRightRadius: receivingSize,
				borderBottomRightRadius: receivingSize,
				marginLeft: 3,
			},
		],
		[receivingSize],
	);
	const receivingAvailableStyle = useMemo(
		() => ({
			width: receivingWidth,
			height: receivingSize,
			borderTopRightRadius: receivingSize,
			borderBottomRightRadius: receivingSize,
		}),
		[receivingSize, receivingWidth],
	);

	return (
		<View style={disabled && styles.disabled}>
			<View style={styles.balances}>
				<View style={styles.balance}>
					<UpArrow color="purple" width={14} height={14} />
					<Money
						sats={spendingTotal}
						color="purple"
						size="text02m"
						unit="satoshi"
					/>
				</View>
				<View style={styles.balance}>
					<DownArrow color="white" width={14} height={14} />
					<Money
						sats={receivingTotal}
						color="white"
						size="text02m"
						unit="satoshi"
					/>
				</View>
			</View>
			<View style={styles.bars}>
				<ThemedView color="purple5" style={spendingTotalStyle}>
					<ThemedView color="purple" style={spendingAvailableStyle} />
				</ThemedView>
				<ThemedView color="white5" style={receivingTotalStyle}>
					<ThemedView color="white" style={receivingAvailableStyle} />
				</ThemedView>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	balances: {
		flexDirection: 'row',
		justifyContent: 'space-between',
	},
	disabled: {
		opacity: 0.5,
	},
	balance: {
		alignItems: 'center',
		flexDirection: 'row',
	},
	bars: {
		marginTop: 8,
		flexDirection: 'row',
		alignItems: 'center',
	},
	bar: {
		flex: 1,
		flexDirection: 'row',
	},
});

export default memo(LightningChannel);
