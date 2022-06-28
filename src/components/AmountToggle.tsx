import React, { memo, ReactElement, useCallback, useMemo } from 'react';
import {
	Display,
	DisplayHaas,
	View,
	Pressable,
	Text01M,
} from '../styles/components';
import { LayoutAnimation, StyleSheet } from 'react-native';
import { abbreviateNumber } from '../utils/helpers';
import useDisplayValues from '../hooks/displayValues';
import { IDisplayValues } from '../utils/exchange-rate/types';
import { useSelector } from 'react-redux';
import Store from '../store/types';

const FiatBalance = memo(
	({
		displayValues,
		primary = true,
	}: {
		displayValues: IDisplayValues;
		primary: boolean;
	}): ReactElement => {
		LayoutAnimation.easeInEaseOut();
		const { fiatWhole, fiatDecimal, fiatDecimalValue, fiatSymbol } =
			displayValues;
		const Text = useMemo(() => (primary ? DisplayHaas : Text01M), [primary]);

		if (fiatWhole.length > 12) {
			const { newValue, abbreviation } = abbreviateNumber(fiatWhole);
			return (
				<View style={styles.row}>
					<Text style={styles.symbol} color="gray2">
						{fiatSymbol}
					</Text>
					<Text color={primary ? null : 'gray2'}>{newValue}</Text>
					<Text color="gray2">{abbreviation}</Text>
				</View>
			);
		}
		return (
			<View style={styles.row}>
				<Text style={styles.symbol} color="gray2">
					{fiatSymbol}
				</Text>
				<Text color={primary ? null : 'gray2'}>
					{fiatWhole}
					{fiatDecimal}
					{fiatDecimalValue}
				</Text>
			</View>
		);
	},
);

const AssetBalance = memo(
	({
		displayValues,
		primary = true,
	}: {
		displayValues: IDisplayValues;
		primary: boolean;
	}): ReactElement => {
		LayoutAnimation.easeInEaseOut();
		const Text = useMemo(() => (primary ? DisplayHaas : Text01M), [primary]);
		const TextSymbol = useMemo(() => (primary ? Display : Text01M), [primary]);
		const { bitcoinFormatted, bitcoinSymbol } = displayValues;
		return (
			<View style={styles.row}>
				<TextSymbol style={styles.symbol} color="gray2">
					{bitcoinSymbol}
				</TextSymbol>
				<Text color={primary ? null : 'gray2'}>{bitcoinFormatted}</Text>
			</View>
		);
	},
);

/**
 * Displays the total amount of sats specified and it's corresponding fiat value.
 */
const AmountToggle = ({
	sats = 0,
	style,
	onPress,
}: {
	sats: number;
	style?: object;
	onPress?: Function;
}): ReactElement => {
	const primary = useSelector((state: Store) => state.settings.unitPreference);
	const displayValues = useDisplayValues(sats);
	const fiatIsPrimary = useMemo(() => primary === 'fiat', [primary]);

	const getBalanceComponents = useCallback(() => {
		const arr: ReactElement[] = [
			<FiatBalance displayValues={displayValues} primary={fiatIsPrimary} />,
			<AssetBalance displayValues={displayValues} primary={!fiatIsPrimary} />,
		];
		if (!fiatIsPrimary) {
			[arr[0], arr[1]] = [arr[1], arr[0]];
		}
		return arr;
	}, [displayValues, fiatIsPrimary]);

	const BalanceComponents = useMemo(() => {
		return getBalanceComponents().map((Component, i) => (
			<View color="transparent" key={i}>
				{Component}
			</View>
		));
	}, [getBalanceComponents]);

	return (
		<Pressable onPress={onPress} style={[styles.row, style]}>
			<View color="transparent">{BalanceComponents}</View>
		</Pressable>
	);
};

const styles = StyleSheet.create({
	row: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: 'transparent',
	},
	symbol: {
		marginRight: 4,
	},
});

export default memo(AmountToggle);
